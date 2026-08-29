import { query } from '../db/index';
import { ChatConversation, ChatMessage, PaginatedResult } from '../types/index';

interface ConversationFilter {
  status?: string;
  category?: string;
  member_id?: number;
  counselor_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function createConversation(
  memberId: number,
  counselorId?: number,
  caseId?: number,
  category?: string
): Promise<ChatConversation> {
  const now = new Date().toISOString();
  const maxIdResult = await query('SELECT MAX(id) as id FROM chat_conversations');
  const nextId = ((maxIdResult[0] as any).id || 0) + 1;
  const conversationId = `CHT-${String(nextId).padStart(5, '0')}`;

  await query(
    `INSERT INTO chat_conversations (conversation_id, member_id, counselor_id, case_id, category, status, member_unread, counselor_unread, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', 0, 0, ?, ?)`,
    [conversationId, memberId, counselorId || null, caseId || null, category || 'general', now, now]
  );

  const result = await query('SELECT * FROM chat_conversations WHERE conversation_id = ?', [conversationId]);
  return result[0] as ChatConversation;
}

export async function getConversationById(id: number): Promise<ChatConversation | null> {
  const results = await query(
    `SELECT cc.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM chat_conversations cc
     LEFT JOIN members m ON cc.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON cc.counselor_id = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE cc.id = ?`,
    [id]
  );
  return (results[0] as ChatConversation) || null;
}

export async function getConversationsByMember(memberId: number): Promise<ChatConversation[]> {
  const results = await query(
    `SELECT cc.*,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM chat_conversations cc
     LEFT JOIN staff s ON cc.counselor_id = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE cc.member_id = ?
     ORDER BY cc.last_message_at DESC, cc.created_at DESC`,
    [memberId]
  );
  return results as ChatConversation[];
}

export async function getConversationsByCounselor(counselorId: number): Promise<ChatConversation[]> {
  const results = await query(
    `SELECT cc.*,
      m.member_id as member_code,
      mu.name as member_name
     FROM chat_conversations cc
     LEFT JOIN members m ON cc.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE cc.counselor_id = ?
     ORDER BY cc.last_message_at DESC, cc.created_at DESC`,
    [counselorId]
  );
  return results as ChatConversation[];
}

export async function getAllConversations(filter: ConversationFilter): Promise<PaginatedResult<ChatConversation>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.status) {
    conditions.push('cc.status = ?');
    params.push(filter.status);
  }
  if (filter.category) {
    conditions.push('cc.category = ?');
    params.push(filter.category);
  }
  if (filter.member_id) {
    conditions.push('cc.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.counselor_id) {
    conditions.push('cc.counselor_id = ?');
    params.push(filter.counselor_id);
  }
  if (filter.search) {
    conditions.push('(cc.conversation_id LIKE ? OR cc.last_message LIKE ? OR mu.name LIKE ?)');
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const needsJoin = filter.search;
  const memberJoin = needsJoin ? 'LEFT JOIN members m ON cc.member_id = m.id LEFT JOIN users mu ON m.user_id = mu.id' : '';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM chat_conversations cc ${memberJoin} ${whereClause}`,
    params
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT cc.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM chat_conversations cc
     LEFT JOIN members m ON cc.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON cc.counselor_id = s.id
     LEFT JOIN users su ON s.user_id = su.id
     ${whereClause}
     ORDER BY cc.last_message_at DESC NULLS LAST, cc.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: data as ChatConversation[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function sendMessage(
  conversationId: number,
  senderId: number,
  senderType: string,
  data: { message: string; message_type?: string; attachment_url?: string }
): Promise<ChatMessage> {
  const now = new Date().toISOString();

  const convResult = await query('SELECT * FROM chat_conversations WHERE id = ?', [conversationId]);
  if (convResult.length === 0) {
    throw new Error('Conversation not found');
  }
  const conv = convResult[0] as any;

  await query(
    `INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message, message_type, attachment_url, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      conversationId,
      senderId,
      senderType,
      data.message,
      data.message_type || 'text',
      data.attachment_url || null,
      now,
    ]
  );

  const messageResult = await query('SELECT MAX(id) as id FROM chat_messages');
  const messageId = (messageResult[0] as any).id;

  const unreadUpdate = senderType === 'member'
    ? 'counselor_unread = counselor_unread + 1'
    : 'member_unread = member_unread + 1';

  await query(
    `UPDATE chat_conversations
     SET last_message = ?, last_message_at = ?, ${unreadUpdate}, updated_at = ?
     WHERE id = ?`,
    [data.message, now, now, conversationId]
  );

  const result = await query('SELECT * FROM chat_messages WHERE id = ?', [messageId]);
  return result[0] as ChatMessage;
}

export async function getMessages(
  conversationId: number,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResult<ChatMessage>> {
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id = ?',
    [conversationId]
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT cm.*, u.name as sender_name
     FROM chat_messages cm
     LEFT JOIN users u ON cm.sender_id = u.id
     WHERE cm.conversation_id = ?
     ORDER BY cm.created_at ASC
     LIMIT ? OFFSET ?`,
    [conversationId, limit, offset]
  );

  return {
    data: data as ChatMessage[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markAsRead(
  conversationId: number,
  userId: number,
  userType: string
): Promise<void> {
  const now = new Date().toISOString();
  const readerIsMember = userType === 'member';

  await query(
    `UPDATE chat_messages
     SET is_read = 1, read_at = ?
     WHERE conversation_id = ? AND sender_type != ? AND is_read = 0`,
    [now, conversationId, userType]
  );

  const unreadColumn = readerIsMember ? 'member_unread' : 'counselor_unread';
  await query(
    `UPDATE chat_conversations SET ${unreadColumn} = 0, updated_at = ? WHERE id = ?`,
    [now, conversationId]
  );
}

export async function searchMessages(
  conversationId: number,
  searchQuery: string
): Promise<ChatMessage[]> {
  const searchPattern = `%${searchQuery}%`;
  const results = await query(
    `SELECT cm.*, u.name as sender_name
     FROM chat_messages cm
     LEFT JOIN users u ON cm.sender_id = u.id
     WHERE cm.conversation_id = ? AND cm.message LIKE ?
     ORDER BY cm.created_at ASC`,
    [conversationId, searchPattern]
  );
  return results as ChatMessage[];
}

export async function archiveConversation(id: number): Promise<ChatConversation | null> {
  const now = new Date().toISOString();
  const existing = await query('SELECT id FROM chat_conversations WHERE id = ?', [id]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE chat_conversations SET status = ?, updated_at = ? WHERE id = ?',
    ['archived', now, id]
  );

  const result = await query('SELECT * FROM chat_conversations WHERE id = ?', [id]);
  return (result[0] as ChatConversation) || null;
}

export async function deleteConversation(id: number): Promise<boolean> {
  const existing = await query('SELECT id FROM chat_conversations WHERE id = ?', [id]);
  if (existing.length === 0) {
    return false;
  }

  await query('DELETE FROM chat_messages WHERE conversation_id = ?', [id]);
  await query('DELETE FROM chat_conversations WHERE id = ?', [id]);
  return true;
}

export async function getUnreadCount(userId: number, userType: string): Promise<number> {
  let results;
  if (userType === 'member') {
    results = await query(
      `SELECT COALESCE(SUM(member_unread), 0) as total
       FROM chat_conversations
       WHERE member_id = ? AND status = 'active'`,
      [userId]
    );
  } else {
    results = await query(
      `SELECT COALESCE(SUM(counselor_unread), 0) as total
       FROM chat_conversations
       WHERE counselor_id = ? AND status = 'active'`,
      [userId]
    );
  }
  return (results[0] as any).total || 0;
}
