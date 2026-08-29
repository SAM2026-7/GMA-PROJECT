var API = {
    auth: {
        login: function(email, password) {
            return apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
        },
        register: function(data) {
            return apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
        },
        me: function() {
            return apiRequest('/api/auth/me');
        }
    },

    content: {
        getAll: function() {
            return apiRequest('/api/content');
        },
        updateSetting: function(key, value) {
            return apiRequest('/api/content/settings', { method: 'PUT', body: JSON.stringify({ key: key, value: value }) });
        },
        updateSection: function(data) {
            return apiRequest('/api/content/sections', { method: 'PUT', body: JSON.stringify(data) });
        }
    },

    siteSettings: {
        get: function() {
            return apiRequest('/api/site-settings');
        }
    },

    members: {
        getMe: function() {
            return apiRequest('/api/members/me');
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/members' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/members/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/members/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        search: function(q) {
            return apiRequest('/api/members/search?q=' + encodeURIComponent(q));
        }
    },

    staff: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/staff' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/staff/' + id);
        },
        create: function(data) {
            return apiRequest('/api/staff', { method: 'POST', body: JSON.stringify(data) });
        },
        update: function(id, data) {
            return apiRequest('/api/staff/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/staff/' + id, { method: 'DELETE' });
        },
        availability: function(id, date) {
            return apiRequest('/api/staff/' + id + '/availability?date=' + encodeURIComponent(date));
        },
        workload: function() {
            return apiRequest('/api/staff/workload');
        }
    },

    bookings: {
        create: function(data) {
            return apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/bookings' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/bookings/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/bookings/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        confirm: function(id) {
            return apiRequest('/api/bookings/' + id + '/confirm', { method: 'PATCH' });
        },
        cancel: function(id) {
            return apiRequest('/api/bookings/' + id + '/cancel', { method: 'PATCH' });
        },
        delete: function(id) {
            return apiRequest('/api/bookings/' + id, { method: 'DELETE' });
        },
        today: function() {
            return apiRequest('/api/bookings/today');
        },
        byMember: function(memberId) {
            return apiRequest('/api/bookings/member/' + memberId);
        },
        calendar: function(staffId, startDate, endDate) {
            return apiRequest('/api/bookings/calendar?staffId=' + staffId + '&startDate=' + startDate + '&endDate=' + endDate);
        }
    },

    cases: {
        create: function(data) {
            return apiRequest('/api/cases', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/cases' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/cases/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/cases/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/cases/' + id, { method: 'DELETE' });
        },
        sessions: function(id) {
            return apiRequest('/api/cases/' + id + '/sessions');
        },
        timeline: function(id) {
            return apiRequest('/api/cases/' + id + '/timeline');
        },
        assign: function(id, counselorId) {
            return apiRequest('/api/cases/' + id + '/assign', { method: 'PATCH', body: JSON.stringify({ counselorId: counselorId }) });
        },
        escalate: function(id, priority) {
            return apiRequest('/api/cases/' + id + '/escalate', { method: 'PATCH', body: JSON.stringify({ priority: priority }) });
        }
    },

    sessions: {
        create: function(data) {
            return apiRequest('/api/sessions', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/sessions' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/sessions/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/sessions/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/sessions/' + id, { method: 'DELETE' });
        },
        byCase: function(caseId) {
            return apiRequest('/api/sessions/case/' + caseId);
        },
        byMember: function(memberId) {
            return apiRequest('/api/sessions/member/' + memberId);
        },
        counselorStats: function(counselorId) {
            return apiRequest('/api/sessions/stats/' + counselorId);
        }
    },

    chat: {
        createConversation: function(data) {
            return apiRequest('/api/chat/conversations', { method: 'POST', body: JSON.stringify(data) });
        },
        byMember: function(memberId) {
            return apiRequest('/api/chat/conversations/member/' + memberId);
        },
        byCounselor: function(counselorId) {
            return apiRequest('/api/chat/conversations/counselor/' + counselorId);
        },
        getAll: function() {
            return apiRequest('/api/chat/conversations');
        },
        sendMessage: function(data) {
            return apiRequest('/api/chat/messages', { method: 'POST', body: JSON.stringify(data) });
        },
        getMessages: function(conversationId, page) {
            var qs = page ? '?page=' + page : '';
            return apiRequest('/api/chat/messages/' + conversationId + qs);
        },
        markRead: function(data) {
            return apiRequest('/api/chat/messages/read', { method: 'PATCH', body: JSON.stringify(data) });
        },
        searchMessages: function(conversationId, q) {
            return apiRequest('/api/chat/messages/search/' + conversationId + '?q=' + encodeURIComponent(q));
        },
        unreadCount: function(userId, type) {
            return apiRequest('/api/chat/unread/' + userId + '?type=' + (type || 'member'));
        }
    },

    prayer: {
        create: function(data) {
            return apiRequest('/api/prayer', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/prayer' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/prayer/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/prayer/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        pray: function(id) {
            return apiRequest('/api/prayer/' + id + '/pray', { method: 'PATCH' });
        },
        assignTeam: function(id, team) {
            return apiRequest('/api/prayer/' + id + '/assign', { method: 'PATCH', body: JSON.stringify({ team: team }) });
        },
        markAnswered: function(id) {
            return apiRequest('/api/prayer/' + id + '/answered', { method: 'PATCH' });
        },
        wall: function(page, limit) {
            var qs = '?page=' + (page || 1) + '&limit=' + (limit || 20);
            return apiRequest('/api/prayer/wall' + qs);
        },
        stats: function() {
            return apiRequest('/api/prayer/stats');
        }
    },

    followups: {
        create: function(data) {
            return apiRequest('/api/followups', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/followups' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/followups/' + id);
        },
        update: function(id, data) {
            return apiRequest('/api/followups/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        complete: function(id) {
            return apiRequest('/api/followups/' + id + '/complete', { method: 'PATCH' });
        },
        overdue: function() {
            return apiRequest('/api/followups/overdue');
        },
        today: function() {
            return apiRequest('/api/followups/today');
        },
        stats: function() {
            return apiRequest('/api/followups/stats');
        },
        byStaff: function(staffId) {
            return apiRequest('/api/followups/staff/' + staffId);
        }
    },

    notifications: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/notifications' + qs);
        },
        unreadCount: function() {
            return apiRequest('/api/notifications/unread-count');
        },
        markRead: function(id) {
            return apiRequest('/api/notifications/' + id + '/read', { method: 'PATCH' });
        },
        markAllRead: function() {
            return apiRequest('/api/notifications/read-all', { method: 'PATCH' });
        },
        delete: function(id) {
            return apiRequest('/api/notifications/' + id, { method: 'DELETE' });
        },
        sendEmail: function(data) {
            return apiRequest('/api/notifications/send-email', { method: 'POST', body: JSON.stringify(data) });
        }
    },

    events: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/events' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/events/' + id);
        },
        create: function(data) {
            return apiRequest('/api/events', { method: 'POST', body: JSON.stringify(data) });
        },
        update: function(id, data) {
            return apiRequest('/api/events/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/events/' + id, { method: 'DELETE' });
        },
        upcoming: function() {
            return apiRequest('/api/events/upcoming');
        }
    },

    sermons: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/sermons' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/sermons/' + id);
        },
        create: function(data) {
            return apiRequest('/api/sermons', { method: 'POST', body: JSON.stringify(data) });
        },
        update: function(id, data) {
            return apiRequest('/api/sermons/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/sermons/' + id, { method: 'DELETE' });
        },
        recent: function(limit) {
            return apiRequest('/api/sermons/recent?limit=' + (limit || 5));
        }
    },

    analytics: {
        dashboard: function() {
            return apiRequest('/api/analytics/dashboard');
        },
        members: function() {
            return apiRequest('/api/analytics/members');
        },
        bookings: function() {
            return apiRequest('/api/analytics/bookings');
        },
        counseling: function() {
            return apiRequest('/api/analytics/counseling');
        },
        prayer: function() {
            return apiRequest('/api/analytics/prayer');
        },
        staff: function(counselorId) {
            var qs = counselorId ? '?counselorId=' + counselorId : '';
            return apiRequest('/api/analytics/staff' + qs);
        },
        engagement: function() {
            return apiRequest('/api/analytics/engagement');
        },
        report: function(type, startDate, endDate) {
            return apiRequest('/api/analytics/report?type=' + type + '&startDate=' + startDate + '&endDate=' + endDate);
        }
    },

    audit: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/audit' + qs);
        },
        recent: function(limit) {
            return apiRequest('/api/audit/recent?limit=' + (limit || 10));
        },
        stats: function() {
            return apiRequest('/api/audit/stats');
        },
        log: function(data) {
            return apiRequest('/api/audit', { method: 'POST', body: JSON.stringify(data) });
        }
    },

    submissions: {
        create: function(data) {
            return apiRequest('/api/submissions', { method: 'POST', body: JSON.stringify(data) });
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/submissions' + qs);
        },
        getById: function(id) {
            return apiRequest('/api/submissions/' + id);
        },
        updateStatus: function(id, status) {
            return apiRequest('/api/submissions/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status: status }) });
        },
        delete: function(id) {
            return apiRequest('/api/submissions/' + id, { method: 'DELETE' });
        }
    },

    testimonies: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/content/testimonies' + qs);
        },
        approved: function(page, limit) {
            return apiRequest('/api/content/testimonies/approved?page=' + (page || 1) + '&limit=' + (limit || 10));
        },
        create: function(data) {
            return apiRequest('/api/content/testimonies', { method: 'POST', body: JSON.stringify(data) });
        },
        approve: function(id) {
            return apiRequest('/api/content/testimonies/' + id + '/approve', { method: 'PATCH' });
        },
        reject: function(id) {
            return apiRequest('/api/content/testimonies/' + id + '/reject', { method: 'PATCH' });
        }
    },

    projects: {
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/content/projects' + qs);
        },
        create: function(data) {
            return apiRequest('/api/content/projects', { method: 'POST', body: JSON.stringify(data) });
        },
        update: function(id, data) {
            return apiRequest('/api/content/projects/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/content/projects/' + id, { method: 'DELETE' });
        }
    },

    announcements: {
        active: function() {
            return apiRequest('/api/content/announcements/active');
        },
        getAll: function(params) {
            var qs = params ? '?' + new URLSearchParams(params).toString() : '';
            return apiRequest('/api/content/announcements' + qs);
        },
        create: function(data) {
            return apiRequest('/api/content/announcements', { method: 'POST', body: JSON.stringify(data) });
        },
        update: function(id, data) {
            return apiRequest('/api/content/announcements/' + id, { method: 'PUT', body: JSON.stringify(data) });
        },
        delete: function(id) {
            return apiRequest('/api/content/announcements/' + id, { method: 'DELETE' });
        }
    }
};
