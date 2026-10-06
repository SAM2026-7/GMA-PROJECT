const API_BASE = window.location.port === '5500' ? 'http://127.0.0.1:3000' : window.location.origin;
const TOKEN_KEY = 'gma_token';
const USER_KEY = 'gma_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
function removeToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function isLoggedIn() { return !!getToken(); }
function getRole() { const u = getUser(); return u ? u.role : null; }
function isMember() { return getRole() === 'member'; }
function isAdmin() { return getRole() === 'admin' || getRole() === 'super_admin'; }
function isPastor() { return getRole() === 'pastor' || getRole() === 'admin' || getRole() === 'super_admin'; }

function escapeHtml(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function apiRequest(path, options) {
    options = options || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(API_BASE + path, Object.assign({}, options, { headers: headers })).then(function(response) {
        return response.text().then(function(text) {
            let body = {};
            try { body = JSON.parse(text); } catch {}
            if (!response.ok) throw new Error(body.error || body.message || 'Request failed (' + response.status + ')');
            return body;
        });
    }).catch(function(err) {
        if (err && err.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw err;
    });
}

window.onerror = function(message, source, lineno, colno, error) {
    try {
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none';
            document.body.appendChild(container);
        }
        var toast = document.createElement('div');
        toast.style.cssText = 'background:#ef4444;color:#fff;padding:12px 16px;border-radius:8px;font-size:14px;max-width:400px;box-shadow:0 4px 6px rgba(0,0,0,0.1);pointer-events:auto';
        toast.textContent = 'Error: ' + message;
        container.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 10000);
    } catch {}
    return true;
};

window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = (reason && reason.message) ? reason.message : String(reason);
    showToast('Unhandled error: ' + message, 'error');
});

function showToast(message, type) {
    type = type || 'info';
    let container = document.querySelector('.toast-container');
    if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
    const icons = { success: '\u2713', error: '\u2717', warning: '\u26A0', info: '\u2139' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span style="font-size:1.2rem">' + (icons[type] || '') + '</span><span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(function() { toast.remove(); }, 300); }, 4000);
}

function showModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }
function closeAllModals() { document.querySelectorAll('.modal-backdrop').forEach(function(m) { m.classList.remove('active'); }); }

function formatDate(d) { return new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatDateTime(d) { return new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function timeAgo(d) {
    var s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago'; if (s < 604800) return Math.floor(s/86400) + 'd ago';
    return formatDate(d);
}
function generateId(prefix) { return prefix + '-' + String(Math.floor(Math.random() * 90000) + 10000); }

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(function(w) { return w.charAt(0); }).join('').toUpperCase().substring(0, 2);
}

function normalizeBooking(b) {
    if (!b) return b;
    b.bookingRef = b.bookingRef || b.booking_id || (b.id ? String(b.id) : '');
    b.memberName = b.memberName || b.member_name || b.visitor_name || b.name || 'Guest';
    b.email = b.email || b.visitor_email || '';
    b.phone = b.phone || b.visitor_phone || '';
    b.serviceType = b.serviceType || b.service_type || b.service || '';
    b.sessionType = b.sessionType || b.session_type || b.type || '';
    b.date = b.date || b.preferred_date || b.bookingDate || '';
    b.time = b.time || b.preferred_time || b.bookingTime || '';
    b.meetingType = b.meetingType || b.meeting_type || '';
    b.preferredContact = b.preferredContact || b.preferred_contact || '';
    b.reason = b.reason || b.notes || b.description || '';
    b.assignedTo = b.assignedTo || b.assigned_to || null;
    b.staffName = b.staffName || b.staff_code || '';
    b.createdAt = b.createdAt || b.created_at || null;
    return b;
}

function normalizeList(result) {
    if (!result) return [];
    var list = Array.isArray(result) ? result : (result.data || []);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeBooking);
}

function normalizeDonation(d) {
    if (!d) return d;
    d.referenceRef = d.referenceRef || d.reference || (d.id ? String(d.id) : '');
    d.donorName = d.donorName || d.donor_name || '';
    d.donorEmail = d.donorEmail || d.donor_email || '';
    d.donorPhone = d.donorPhone || d.donor_phone || '';
    d.memberCode = d.memberCode || d.member_code || '';
    d.referenceNote = d.referenceNote || d.reference_note || '';
    d.createdAt = d.createdAt || d.created_at || null;
    return d;
}

function normalizeDonations(result) {
    if (!result) return [];
    var list = Array.isArray(result) ? result : (result.data || []);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeDonation);
}

function startAutoRefresh(fn, intervalMs) {
    fn();
    var id = setInterval(fn, intervalMs || 30000);
    window.addEventListener('beforeunload', function() { clearInterval(id); });
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) clearInterval(id);
        else { fn(); id = setInterval(fn, intervalMs || 30000); }
    });
    return id;
}

var currentMemberPromise = null;
function getCurrentMember() {
    if (!isLoggedIn()) return Promise.resolve(null);
    if (currentMemberPromise) return currentMemberPromise;
    currentMemberPromise = API.members.getMe()
        .then(function(r) { return (r && r.data) ? r.data : null; })
        .catch(function() { return null; });
    return currentMemberPromise;
}

function setupNavigation() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', function() { links.classList.toggle('show'); });
        links.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', function() { links.classList.remove('show'); }); });
    }
}

function logout() {
    if (!confirm('Sign out of GMA City Complex?')) return;
    var user = getUser();
    if (user && isLoggedIn()) {
        try {
            fetch(API_BASE + '/api/audit', {
                method: 'POST',
                keepalive: true,
                headers: Object.assign({ 'Content-Type': 'application/json' }, getToken() ? { Authorization: 'Bearer ' + getToken() } : {}),
                body: JSON.stringify({
                    action: 'logout',
                    entity_type: 'user',
                    entity_id: user.id || null,
                    details: (user.name || user.email || 'user') + ' signed out'
                })
            }).catch(function() {});
        } catch {}
    }
    removeToken();
    window.location.href = '/pages/login.html';
}

var STAFF_ROLES = ['super_admin', 'admin', 'pastor', 'counselor', 'prayer_coordinator', 'healing_minister', 'followup_officer', 'branch_admin', 'analytics_officer'];
function isStaff() { return STAFF_ROLES.indexOf(getRole()) >= 0; }

function requireAuth(role) {
    if (!isLoggedIn()) { window.location.href = '/pages/login.html'; return false; }
    var userRole = getRole();
    if (!role) return true;
    if (role === 'staff') { if (!isStaff()) { window.location.href = '/index.html'; return false; } return true; }
    if (role === 'admin') { if (!isStaff()) { window.location.href = '/index.html'; return false; } return true; }
    if (userRole !== role) { window.location.href = isStaff() ? '/admin/dashboard.html' : '/member/dashboard.html'; return false; }
    return true;
}

function requireMember() { return requireAuth('member'); }
function requireAdmin() { return requireAuth('staff'); }
function requirePastor() { return requireAuth('staff'); }

function logFrontendAction(action, entityType, entityId, details) {
    if (!isLoggedIn()) return;
    var user = getUser();
    API.audit.log({
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        details: details
    }).catch(function() {});
}

function saveLocalSubmission(data) {
    var items = [];
    try { items = JSON.parse(localStorage.getItem('gma_submissions') || '[]'); } catch {}
    items.push(Object.assign({ submittedAt: new Date().toISOString() }, data));
    localStorage.setItem('gma_submissions', JSON.stringify(items));
}

function getLocalSubmissions() {
    try { return JSON.parse(localStorage.getItem('gma_submissions') || '[]'); } catch { return []; }
}

function renderServiceTimes() {
    var now = new Date();
    var SERVICE_TIMES = [{ day: 0, hour: 10, minute: 0 }, { day: 4, hour: 17, minute: 30 }];
    var dates = SERVICE_TIMES.map(function(s) {
        var d = new Date(now);
        d.setDate(now.getDate() + (s.day - now.getDay() + 7) % 7);
        d.setHours(s.hour, s.minute, 0, 0);
        if (d <= now) d.setDate(d.getDate() + 7);
        return d;
    }).sort(function(a, b) { return a - b; });
    var next = dates[0];
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var h = next.getHours() % 12 || 12;
    var m = String(next.getMinutes()).padStart(2, '0');
    var p = next.getHours() >= 12 ? 'PM' : 'AM';
    var rem = next.getTime() - now.getTime();
    var hrs = Math.floor(rem / 3600000);
    var mins = Math.floor((rem % 3600000) / 60000);
    return 'Next Service: ' + days[next.getDay()] + ' at ' + h + ':' + m + ' ' + p + ' (in ' + hrs + 'h ' + mins + 'm)';
}
