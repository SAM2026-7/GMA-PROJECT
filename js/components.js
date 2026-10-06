function renderPublicNav(activePage) {
    var links = [
        { href: '/index.html', label: 'Home', id: 'home' },
        { href: '/pages/about.html', label: 'About', id: 'about' },
        { href: '/pages/programs.html', label: 'Programs', id: 'programs' },
        { href: '/pages/events.html', label: 'Events', id: 'events' },
        { href: '/pages/sermons.html', label: 'Sermons', id: 'sermons' },
        { href: '/pages/testimonies.html', label: 'Testimonies', id: 'testimonies' },
        { href: '/pages/contact.html', label: 'Contact', id: 'contact' }
    ];
    var user = getUser();
    var html = '<header class="navbar"><div class="container nav-inner">';
    html += '<a href="/index.html" class="logo"><span class="logo-badge">GMA</span><span class="logo-text">City Complex</span></a>';
    html += '<nav class="nav-links" id="navLinks">';
    links.forEach(function(l) {
        html += '<a href="' + l.href + '"' + (activePage === l.id ? ' class="active"' : '') + '>' + l.label + '</a>';
    });
    html += '</nav><div class="nav-actions">';
    if (user) {
        html += '<a href="/member/dashboard.html" class="btn btn-secondary btn-sm">Dashboard</a>';
        html += '<button onclick="removeToken();window.location.href=\'/index.html\'" class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,0.8)">Logout</button>';
    } else {
        html += '<a href="/pages/login.html" class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,0.8)">Login</a>';
        html += '<a href="/pages/register.html" class="btn btn-secondary btn-sm">Join Us</a>';
    }
    html += '<button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">&#9776;</button>';
    html += '</div></div></header>';
    return html;
}

function renderFooter() {
    var defaults = { hero_description: 'Building a community of faith, hope, and love through pastoral care and counseling services.', contact_phone: '+234 801 234 5678', contact_email: 'info@gmacitycomplex.org', contact_address: '12 Wetheral Road, GRA, Jos, Plateau State', site_name: 'GMA City Complex' };
    var settings = window._siteSettings || defaults;
    return '<footer class="footer"><div class="container">' +
        '<div class="footer-grid">' +
        '<div><h4>GMA City Complex</h4><p>' + escapeHtml(settings.hero_description || defaults.hero_description) + '</p></div>' +
        '<div><h4>Quick Links</h4><div class="footer-links">' +
        '<a href="/pages/programs.html">Programs</a>' +
        '<a href="/pages/events.html">Events</a>' +
        '<a href="/pages/sermons.html">Sermons</a>' +
        '<a href="/pages/prayer-wall.html">Prayer Wall</a>' +
        '<a href="/pages/giving.html">Giving</a></div></div>' +
        '<div><h4>Programs</h4><div class="footer-links">' +
        '<a href="/pages/programs.html">Counseling</a>' +
        '<a href="/pages/programs.html">Healing</a>' +
        '<a href="/pages/programs.html">Prayer</a>' +
        '<a href="/pages/testimonies.html">Testimonies</a></div></div>' +
        '<div><h4>Contact</h4>' +
        '<p>\u260E ' + escapeHtml(settings.contact_phone || defaults.contact_phone) + '</p>' +
        '<p>\u2709 ' + escapeHtml(settings.contact_email || defaults.contact_email) + '</p>' +
        '<p>\uD83D\uDCCD ' + escapeHtml(settings.contact_address || defaults.contact_address) + '</p></div>' +
        '</div><div class="footer-bottom"><p>&copy; 2026 ' + escapeHtml(settings.site_name || defaults.site_name) + '. All rights reserved.</p></div></div></footer>';
}

function loadSiteSettings() {
    if (window._siteSettings) return Promise.resolve(window._siteSettings);
    return apiRequest('/api/site-settings').then(function(data) {
        var s = {};
        if (Array.isArray(data)) { data.forEach(function(k) { s[k.key] = k.value; }); }
        else if (data && data.data && Array.isArray(data.data)) { data.data.forEach(function(k) { s[k.key] = k.value; }); }
        window._siteSettings = s;
        return s;
    }).catch(function() {
        window._siteSettings = {};
        return {};
    });
}

function updateBadges() {
    var user = getUser();
    if (!user) return;
    var token = getToken();
    if (!token) return;
    var memberId = user.memberId || user.id;
    if (user.role === 'member') {
        apiRequest('/api/chat/unread/' + memberId + '?type=member').then(function(r) {
            var el = document.querySelector('.sidebar-link[href="/member/chat.html"] .badge');
            var c = (r && r.data && r.data.count) ? r.data.count : 0;
            if (el) { el.textContent = c || ''; el.style.display = c ? '' : 'none'; }
        }).catch(function(){});
        apiRequest('/api/notifications/unread-count').then(function(r) {
            var el = document.querySelector('.sidebar-link[href="/member/notifications.html"] .badge');
            var c = (r && r.data && r.data.count) ? r.data.count : 0;
            if (el) { el.textContent = c || ''; el.style.display = c ? '' : 'none'; }
        }).catch(function(){});
    }
}

function loadPageSettings() {
    loadSiteSettings().then(function() {
        var el;
        el = document.getElementById('footerContainer');
        if (el) el.innerHTML = renderFooter();
        document.querySelectorAll('[data-site-name]').forEach(function(e) { e.textContent = (window._siteSettings || {}).site_name || 'GMA City Complex'; });
    });
}

function renderMemberSidebar(activePage) {
    var links = [
        { section: 'Main', items: [
            { href: '/member/dashboard.html', icon: '\uD83C\uDFE0', label: 'Dashboard', id: 'dashboard' },
            { href: '/member/profile.html', icon: '\uD83D\uDC64', label: 'My Profile', id: 'profile' },
            { href: '/member/bookings.html', icon: '\uD83D\uDCC5', label: 'My Bookings', id: 'bookings' },
            { href: '/member/counseling.html', icon: '\uD83D\uDCA1', label: 'My Counseling', id: 'counseling' }
        ]},
        { section: 'Spiritual', items: [
            { href: '/member/prayer-requests.html', icon: '\uD83D\uDE4F', label: 'Prayer Requests', id: 'prayer-requests' },
            { href: '/pages/prayer-wall.html', icon: '\uD83D\uDD17', label: 'Prayer Wall', id: 'prayer-wall' }
        ]},
        { section: 'Connect', items: [
            { href: '/member/chat.html', icon: '\uD83D\uDCAC', label: 'Chat', id: 'chat', badge: '2' },
            { href: '/member/notifications.html', icon: '\uD83D\uDD14', label: 'Notifications', id: 'notifications', badge: '2' }
        ]},
        { section: 'Giving', items: [
            { href: '/member/giving.html', icon: '\uD83D\uDCB0', label: 'My Giving', id: 'giving' },
            { href: '/pages/giving.html', icon: '\u2764\uFE0F', label: 'Give Now', id: 'give-now' }
        ]},
        { section: 'More', items: [
            { href: '/pages/events.html', icon: '\uD83C\uDFB5', label: 'Events', id: 'events' },
            { href: '/pages/sermons.html', icon: '\uD83C\uDFAC', label: 'Sermons', id: 'sermons' },
            { href: '/pages/testimonies.html', icon: '\u2B50', label: 'Testimonies', id: 'testimonies' },
            { href: '/pages/projects.html', icon: '\uD83C\uDFD7\uFE0F', label: 'Projects', id: 'projects' },
            { href: '/pages/faq.html', icon: '\u2753', label: 'Help / FAQ', id: 'faq' }
        ]}
    ];
    var html = '<aside class="sidebar" id="sidebar"><div class="sidebar-menu">';
    links.forEach(function(section) {
        html += '<div class="sidebar-section">' + section.section + '</div>';
        section.items.forEach(function(item) {
            html += '<a href="' + item.href + '" class="sidebar-link' + (activePage === item.id ? ' active' : '') + '">';
            html += '<span class="icon">' + item.icon + '</span><span>' + item.label + '</span>';
            if (item.badge) html += '<span class="badge">' + item.badge + '</span>';
            html += '</a>';
        });
    });
    html += '<div class="sidebar-section">Account</div>';
    html += '<a href="#" class="sidebar-link" onclick="logout();return false"><span class="icon">\uD83D\uDEAA</span><span>Logout</span></a>';
    html += '</div></aside>';
    return html;
}

function renderAdminSidebar(activePage) {
    var links = [
        { section: 'Overview', items: [
            { href: '/admin/dashboard.html', icon: '\uD83D\uDCCA', label: 'Dashboard', id: 'dashboard' }
        ]},
        { section: 'People', items: [
            { href: '/admin/members.html', icon: '\uD83D\uDC65', label: 'Members', id: 'members' },
            { href: '/admin/visitors.html', icon: '\uD83C\uDF10', label: 'Visitors', id: 'visitors' }
        ]},
        { section: 'Pastoral Care', items: [
            { href: '/admin/bookings.html', icon: '\uD83D\uDCC5', label: 'Bookings', id: 'bookings' },
            { href: '/admin/cases.html', icon: '\uD83D\uDCCB', label: 'Cases', id: 'cases' },
            { href: '/admin/counselors.html', icon: '\uD83D\uDC64', label: 'Counselors', id: 'counselors' },
            { href: '/admin/followups.html', icon: '\uD83D\uDD04', label: 'Follow-ups', id: 'followups' }
        ]},
        { section: 'Communication', items: [
            { href: '/admin/chat.html', icon: '\uD83D\uDCAC', label: 'Chat', id: 'chat' },
            { href: '/admin/prayer-requests.html', icon: '\uD83D\uDE4F', label: 'Prayer Requests', id: 'prayer-requests' }
        ]},
        { section: 'Content', items: [
            { href: '/admin/events.html', icon: '\uD83C\uDFB5', label: 'Events', id: 'events' },
            { href: '/admin/sermons.html', icon: '\uD83C\uDFAC', label: 'Sermons', id: 'sermons' },
            { href: '/admin/testimonies.html', icon: '\u2B50', label: 'Testimonies', id: 'testimonies' },
            { href: '/admin/projects.html', icon: '\uD83C\uDFD7\uFE0F', label: 'Projects', id: 'projects' },
            { href: '/admin/announcements.html', icon: '\uD83D\uDCE2', label: 'Announcements', id: 'announcements' }
        ]},
        { section: 'Finance', items: [
            { href: '/admin/giving.html', icon: '\uD83D\uDCB0', label: 'Giving', id: 'giving' }
        ]},
        { section: 'Analytics', items: [
            { href: '/admin/analytics.html', icon: '\uD83D\uDCC8', label: 'Analytics', id: 'analytics' }
        ]},
        { section: 'System', items: [
            { href: '/admin/settings.html', icon: '\u2699\uFE0F', label: 'Settings', id: 'settings' }
        ]}
    ];
    var html = '<aside class="sidebar" id="sidebar"><div class="sidebar-menu">';
    links.forEach(function(section) {
        html += '<div class="sidebar-section">' + section.section + '</div>';
        section.items.forEach(function(item) {
            html += '<a href="' + item.href + '" class="sidebar-link' + (activePage === item.id ? ' active' : '') + '">';
            html += '<span class="icon">' + item.icon + '</span><span>' + item.label + '</span>';
            html += '</a>';
        });
    });
    html += '<div class="sidebar-section">Account</div>';
    html += '<a href="#" class="sidebar-link" onclick="logout();return false"><span class="icon">\uD83D\uDEAA</span><span>Logout</span></a>';
    html += '</div></aside>';
    return html;
}

function renderServiceTimes() {
    var el = document.getElementById('nextServiceText');
    if (el) { el.textContent = getNextServiceText(); setInterval(function() { el.textContent = getNextServiceText(); }, 60000); }
}

function formatCurrency(amount) {
    return '\u20A6' + Number(amount).toLocaleString('en-NG');
}

function getPercentage(raised, target) {
    return Math.min(Math.round((raised / target) * 100), 100);
}

function getStatusBadge(status) {
    var map = {
        'new': 'badge-info', 'pending': 'badge-warning', 'confirmed': 'badge-success',
        'active': 'badge-success', 'completed': 'badge-primary', 'cancelled': 'badge-danger',
        'closed': 'badge-primary', 'contacted': 'badge-info', 'received': 'badge-info',
        'assigned': 'badge-warning', 'being_prayed': 'badge-primary', 'follow_up': 'badge-gold',
        'available': 'badge-success', 'busy': 'badge-danger', 'inactive': 'badge-danger',
        'urgent': 'badge-danger', 'high': 'badge-warning', 'normal': 'badge-info'
    };
    return '<span class="badge ' + (map[status] || 'badge-primary') + '">' + escapeHtml(status.replace(/_/g, ' ')) + '</span>';
}
