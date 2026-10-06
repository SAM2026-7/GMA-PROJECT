import { query } from '../db/index';

export async function getDashboardStats(): Promise<{
  totalMembers: number;
  activeCases: number;
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalPrayerRequests: number;
  totalGiving: number;
  unreadChats: number;
  followupsDueToday: number;
  overdueFollowups: number;
  recentBookings: any[];
}> {
  const today = new Date().toISOString().split('T')[0];

  const totalMembersResult = await query('SELECT COUNT(*) as count FROM members');
  const activeCasesResult = await query("SELECT COUNT(*) as count FROM cases WHERE status IN ('open', 'in_progress')");
  const totalBookingsResult = await query('SELECT COUNT(*) as count FROM bookings');
  const todayBookingsResult = await query('SELECT COUNT(*) as count FROM bookings WHERE preferred_date = ?', [today]);
  const pendingBookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'new')");
  const confirmedBookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
  const completedBookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'");
  const totalPrayerResult = await query('SELECT COUNT(*) as count FROM prayer_requests');
  const totalGivingResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM donations');
  const unreadChatsResult = await query('SELECT COALESCE(SUM(member_unread + counselor_unread), 0) as total FROM chat_conversations');
  const followupsDueResult = await query("SELECT COUNT(*) as count FROM followups WHERE due_date = ? AND status != 'completed'", [today]);
  const overdueResult = await query("SELECT COUNT(*) as count FROM followups WHERE due_date < ? AND status != 'completed'", [today]);

  const recentBookings = await query(
    `SELECT b.id, b.booking_id, b.visitor_name, b.service_type, b.session_type,
            b.preferred_date, b.preferred_time, b.meeting_type, b.status, b.created_at,
            m.member_id as member_code
     FROM bookings b
     LEFT JOIN members m ON b.member_id = m.id
     ORDER BY b.created_at DESC
     LIMIT 5`
  );

  return {
    totalMembers: (totalMembersResult[0] as any).count || 0,
    activeCases: (activeCasesResult[0] as any).count || 0,
    totalBookings: (totalBookingsResult[0] as any).count || 0,
    todayBookings: (todayBookingsResult[0] as any).count || 0,
    pendingBookings: (pendingBookingsResult[0] as any).count || 0,
    confirmedBookings: (confirmedBookingsResult[0] as any).count || 0,
    completedBookings: (completedBookingsResult[0] as any).count || 0,
    totalPrayerRequests: (totalPrayerResult[0] as any).count || 0,
    totalGiving: (totalGivingResult[0] as any).total || 0,
    unreadChats: (unreadChatsResult[0] as any).total || 0,
    followupsDueToday: (followupsDueResult[0] as any).count || 0,
    overdueFollowups: (overdueResult[0] as any).count || 0,
    recentBookings: recentBookings as any[],
  };
}

export async function getMemberAnalytics(): Promise<{
  total: number;
  newThisMonth: number;
  active: number;
  inactive: number;
  byBranch: { church_branch: string; count: number }[];
  growthByMonth: { month: string; count: number }[];
}> {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const totalResult = await query('SELECT COUNT(*) as count FROM members');
  const newThisMonthResult = await query('SELECT COUNT(*) as count FROM members WHERE created_at >= ?', [firstOfMonth]);
  const activeResult = await query("SELECT COUNT(*) as count FROM members WHERE membership_status = 'active'");
  const inactiveResult = await query("SELECT COUNT(*) as count FROM members WHERE membership_status != 'active' OR membership_status IS NULL");

  const byBranch = await query(
    'SELECT church_branch, COUNT(*) as count FROM members GROUP BY church_branch ORDER BY count DESC'
  );

  const growthByMonth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    const countResult = await query(
      'SELECT COUNT(*) as count FROM members WHERE created_at >= ? AND created_at < ?',
      [monthStart, monthEnd]
    );

    growthByMonth.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: (countResult[0] as any).count || 0,
    });
  }

  return {
    total: (totalResult[0] as any).count || 0,
    newThisMonth: (newThisMonthResult[0] as any).count || 0,
    active: (activeResult[0] as any).count || 0,
    inactive: (inactiveResult[0] as any).count || 0,
    byBranch: byBranch as { church_branch: string; count: number }[],
    growthByMonth,
  };
}

export async function getBookingAnalytics(): Promise<{
  total: number;
  byStatus: { status: string; count: number }[];
  byServiceType: { service_type: string; count: number }[];
  byMonth: { month: string; count: number }[];
  averageWaitTime: number;
}> {
  const totalResult = await query('SELECT COUNT(*) as count FROM bookings');

  const byStatus = await query(
    'SELECT status, COUNT(*) as count FROM bookings GROUP BY status ORDER BY count DESC'
  );

  const byServiceType = await query(
    'SELECT service_type, COUNT(*) as count FROM bookings GROUP BY service_type ORDER BY count DESC'
  );

  const now = new Date();
  const byMonth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    const countResult = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE created_at >= ? AND created_at < ?',
      [monthStart, monthEnd]
    );

    byMonth.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: (countResult[0] as any).count || 0,
    });
  }

  const waitTimeResult = await query(
    `SELECT AVG(julianday(updated_at) - julianday(created_at)) * 24 as avg_hours
     FROM bookings WHERE status IN ('confirmed', 'completed')`
  );
  const averageWaitTime = Math.round(((waitTimeResult[0] as any).avg_hours || 0) * 100) / 100;

  return {
    total: (totalResult[0] as any).count || 0,
    byStatus: byStatus as { status: string; count: number }[],
    byServiceType: byServiceType as { service_type: string; count: number }[],
    byMonth,
    averageWaitTime,
  };
}

export async function getCounselingAnalytics(): Promise<{
  totalCases: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  completedVsCancelled: { completed: number; cancelled: number };
  openVsClosed: { open: number; closed: number };
}> {
  const totalCasesResult = await query('SELECT COUNT(*) as count FROM cases');

  const byCategory = await query(
    'SELECT category, COUNT(*) as count FROM cases GROUP BY category ORDER BY count DESC'
  );

  const byStatus = await query(
    'SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY count DESC'
  );

  const completedResult = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'closed'");
  const cancelledResult = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'cancelled'");
  const openResult = await query("SELECT COUNT(*) as count FROM cases WHERE status IN ('open', 'in_progress')");
  const closedResult = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'closed'");

  return {
    totalCases: (totalCasesResult[0] as any).count || 0,
    byCategory: byCategory as { category: string; count: number }[],
    byStatus: byStatus as { status: string; count: number }[],
    completedVsCancelled: {
      completed: (completedResult[0] as any).count || 0,
      cancelled: (cancelledResult[0] as any).count || 0,
    },
    openVsClosed: {
      open: (openResult[0] as any).count || 0,
      closed: (closedResult[0] as any).count || 0,
    },
  };
}

export async function getPrayerAnalytics(): Promise<{
  totalRequests: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byUrgency: { urgency: string; count: number }[];
  answeredRate: number;
  byMonth: { month: string; count: number }[];
}> {
  const totalResult = await query('SELECT COUNT(*) as count FROM prayer_requests');

  const byCategory = await query(
    'SELECT category, COUNT(*) as count FROM prayer_requests GROUP BY category ORDER BY count DESC'
  );

  const byStatus = await query(
    'SELECT status, COUNT(*) as count FROM prayer_requests GROUP BY status ORDER BY count DESC'
  );

  const byUrgency = await query(
    'SELECT urgency, COUNT(*) as count FROM prayer_requests GROUP BY urgency ORDER BY count DESC'
  );

  const answeredResult = await query('SELECT COUNT(*) as count FROM prayer_requests WHERE answered = 1');
  const total = (totalResult[0] as any).count || 0;
  const answered = (answeredResult[0] as any).count || 0;
  const answeredRate = total > 0 ? Math.round((answered / total) * 10000) / 100 : 0;

  const now = new Date();
  const byMonth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    const countResult = await query(
      'SELECT COUNT(*) as count FROM prayer_requests WHERE created_at >= ? AND created_at < ?',
      [monthStart, monthEnd]
    );

    byMonth.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: (countResult[0] as any).count || 0,
    });
  }

  return {
    totalRequests: (totalResult[0] as any).count || 0,
    byCategory: byCategory as { category: string; count: number }[],
    byStatus: byStatus as { status: string; count: number }[],
    byUrgency: byUrgency as { urgency: string; count: number }[],
    answeredRate,
    byMonth,
  };
}

export async function getStaffAnalytics(staffId?: number): Promise<{
  casesAssigned: number;
  completed: number;
  pending: number;
  followupsDone: number;
  sessionsConducted: number;
  byStaff?: { staff_id: number; name: string; cases_assigned: number; completed: number; sessions: number }[];
}> {
  if (staffId) {
    const casesAssignedResult = await query(
      'SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ?',
      [staffId]
    );
    const completedResult = await query(
      "SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ? AND status = 'closed'",
      [staffId]
    );
    const pendingResult = await query(
      "SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ? AND status IN ('open', 'in_progress')",
      [staffId]
    );
    const followupsDoneResult = await query(
      "SELECT COUNT(*) as count FROM followups WHERE assigned_staff = ? AND status = 'completed'",
      [staffId]
    );
    const sessionsResult = await query(
      "SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ? AND attendance = 'attended'",
      [staffId]
    );

    return {
      casesAssigned: (casesAssignedResult[0] as any).count || 0,
      completed: (completedResult[0] as any).count || 0,
      pending: (pendingResult[0] as any).count || 0,
      followupsDone: (followupsDoneResult[0] as any).count || 0,
      sessionsConducted: (sessionsResult[0] as any).count || 0,
    };
  }

  const staffList = await query(
    `SELECT s.id, u.name FROM staff s JOIN users u ON s.user_id = u.id ORDER BY s.id`
  );

  const byStaff: { staff_id: number; name: string; cases_assigned: number; completed: number; sessions: number }[] = [];

  for (const staff of staffList) {
    const s = staff as any;

    const casesResult = await query(
      'SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ?',
      [s.id]
    );
    const completedResult = await query(
      "SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ? AND status = 'closed'",
      [s.id]
    );
    const sessionsResult = await query(
      "SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ? AND attendance = 'attended'",
      [s.id]
    );

    byStaff.push({
      staff_id: s.id,
      name: s.name,
      cases_assigned: (casesResult[0] as any).count || 0,
      completed: (completedResult[0] as any).count || 0,
      sessions: (sessionsResult[0] as any).count || 0,
    });
  }

  const totalCasesAssigned = byStaff.reduce((sum, s) => sum + s.cases_assigned, 0);
  const totalCompleted = byStaff.reduce((sum, s) => sum + s.completed, 0);
  const totalSessions = byStaff.reduce((sum, s) => sum + s.sessions, 0);

  const allPendingResult = await query(
    "SELECT COUNT(*) as count FROM cases WHERE status IN ('open', 'in_progress')"
  );
  const allFollowupsDoneResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE status = 'completed'"
  );

  return {
    casesAssigned: totalCasesAssigned,
    completed: totalCompleted,
    pending: (allPendingResult[0] as any).count || 0,
    followupsDone: (allFollowupsDoneResult[0] as any).count || 0,
    sessionsConducted: totalSessions,
    byStaff,
  };
}

export async function getEngagementMetrics(): Promise<{
  totalBookings: number;
  chatActivityCount: number;
  eventRegistrations: number;
  totalPrayerRequests: number;
}> {
  const totalBookingsResult = await query('SELECT COUNT(*) as count FROM bookings');
  const chatActivityResult = await query('SELECT COUNT(*) as count FROM chat_messages');
  const eventResult = await query('SELECT COUNT(*) as count FROM events WHERE registration_required = 1');
  const prayerResult = await query('SELECT COUNT(*) as count FROM prayer_requests');

  return {
    totalBookings: (totalBookingsResult[0] as any).count || 0,
    chatActivityCount: (chatActivityResult[0] as any).count || 0,
    eventRegistrations: (eventResult[0] as any).count || 0,
    totalPrayerRequests: (prayerResult[0] as any).count || 0,
  };
}

export async function getReport(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<{
  period: { start: string; end: string; type: string };
  members: { new: number; total: number };
  bookings: { total: number; completed: number; cancelled: number };
  cases: { opened: number; closed: number; total: number };
  prayerRequests: { total: number; answered: number };
  sessions: { total: number; attended: number };
  followups: { total: number; completed: number; overdue: number };
}> {
  const today = new Date().toISOString().split('T')[0];

  const newMembersResult = await query(
    'SELECT COUNT(*) as count FROM members WHERE created_at >= ? AND created_at <= ?',
    [startDate, endDate]
  );
  const totalMembersResult = await query('SELECT COUNT(*) as count FROM members');

  const bookingsTotalResult = await query(
    'SELECT COUNT(*) as count FROM bookings WHERE created_at >= ? AND created_at <= ?',
    [startDate, endDate]
  );
  const bookingsCompletedResult = await query(
    "SELECT COUNT(*) as count FROM bookings WHERE status = 'completed' AND created_at >= ? AND created_at <= ?",
    [startDate, endDate]
  );
  const bookingsCancelledResult = await query(
    "SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled' AND created_at >= ? AND created_at <= ?",
    [startDate, endDate]
  );

  const casesOpenedResult = await query(
    'SELECT COUNT(*) as count FROM cases WHERE date_opened >= ? AND date_opened <= ?',
    [startDate, endDate]
  );
  const casesClosedResult = await query(
    'SELECT COUNT(*) as count FROM cases WHERE date_closed >= ? AND date_closed <= ?',
    [startDate, endDate]
  );
  const casesTotalResult = await query('SELECT COUNT(*) as count FROM cases');

  const prayerTotalResult = await query(
    'SELECT COUNT(*) as count FROM prayer_requests WHERE created_at >= ? AND created_at <= ?',
    [startDate, endDate]
  );
  const prayerAnsweredResult = await query(
    "SELECT COUNT(*) as count FROM prayer_requests WHERE answered = 1 AND answered_date >= ? AND answered_date <= ?",
    [startDate, endDate]
  );

  const sessionsTotalResult = await query(
    'SELECT COUNT(*) as count FROM session_records WHERE session_date >= ? AND session_date <= ?',
    [startDate, endDate]
  );
  const sessionsAttendedResult = await query(
    "SELECT COUNT(*) as count FROM session_records WHERE attendance = 'attended' AND session_date >= ? AND session_date <= ?",
    [startDate, endDate]
  );

  const followupsTotalResult = await query(
    'SELECT COUNT(*) as count FROM followups WHERE created_at >= ? AND created_at <= ?',
    [startDate, endDate]
  );
  const followupsCompletedResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE status = 'completed' AND completed_at >= ? AND completed_at <= ?",
    [startDate, endDate]
  );
  const followupsOverdueResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE due_date < ? AND status != 'completed'",
    [today]
  );

  return {
    period: { start: startDate, end: endDate, type },
    members: {
      new: (newMembersResult[0] as any).count || 0,
      total: (totalMembersResult[0] as any).count || 0,
    },
    bookings: {
      total: (bookingsTotalResult[0] as any).count || 0,
      completed: (bookingsCompletedResult[0] as any).count || 0,
      cancelled: (bookingsCancelledResult[0] as any).count || 0,
    },
    cases: {
      opened: (casesOpenedResult[0] as any).count || 0,
      closed: (casesClosedResult[0] as any).count || 0,
      total: (casesTotalResult[0] as any).count || 0,
    },
    prayerRequests: {
      total: (prayerTotalResult[0] as any).count || 0,
      answered: (prayerAnsweredResult[0] as any).count || 0,
    },
    sessions: {
      total: (sessionsTotalResult[0] as any).count || 0,
      attended: (sessionsAttendedResult[0] as any).count || 0,
    },
    followups: {
      total: (followupsTotalResult[0] as any).count || 0,
      completed: (followupsCompletedResult[0] as any).count || 0,
      overdue: (followupsOverdueResult[0] as any).count || 0,
    },
  };
}
