function renderMemberHeader(activePage) {
    var user = getUser();
    var name = user ? user.name : 'Member';
    var unread = 2;
    return '<header class="navbar"><div class="container nav-inner">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
        '<button class="nav-toggle" id="sidebarToggle" aria-label="Toggle sidebar" style="display:none">&#9776;</button>' +
        '<a href="/member/dashboard.html" class="logo"><span class="logo-badge">GMA</span><span class="logo-text">City Complex</span></a>' +
        '</div>' +
        '<nav class="nav-links" id="navLinks" style="display:flex;gap:8px">' +
        '<a href="/index.html" style="color:rgba(255,255,255,0.7)">Home</a>' +
        '<a href="/pages/events.html" style="color:rgba(255,255,255,0.7)">Events</a>' +
        '<a href="/pages/sermons.html" style="color:rgba(255,255,255,0.7)">Sermons</a>' +
        '</nav>' +
        '<div class="nav-actions">' +
        '<a href="/member/notifications.html" style="position:relative;color:#fff;text-decoration:none;font-size:1.2rem;padding:8px" title="Notifications">' +
        '\uD83D\uDD14' + (unread > 0 ? '<span style="position:absolute;top:2px;right:2px;width:18px;height:18px;background:var(--danger);border-radius:50%;font-size:0.65rem;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">' + unread + '</span>' : '') +
        '</a>' +
        '<a href="/member/profile.html" class="avatar" title="' + escapeHtml(name) + '">' + getInitials(name) + '</a>' +
        '</div></div></header>';
}

function renderMemberLayout(activePage, content) {
    return renderMemberHeader(activePage) + renderMemberSidebar(activePage) +
        '<div class="layout"><main class="main-content">' + content + '</main></div>';
}

function renderAdminHeader(activePage) {
    var user = getUser();
    var name = user ? user.name : 'Admin';
    return '<header class="navbar"><div class="container nav-inner">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
        '<button class="nav-toggle" id="sidebarToggle" aria-label="Toggle sidebar" style="display:none">&#9776;</button>' +
        '<a href="/admin/dashboard.html" class="logo"><span class="logo-badge">GMA</span><span class="logo-text">Admin Panel</span></a>' +
        '</div>' +
        '<div class="nav-actions">' +
        '<span style="color:rgba(255,255,255,0.7);font-size:0.9rem">Welcome, ' + escapeHtml(name) + '</span>' +
        '<button class="btn btn-sm" id="adminLogoutBtn" style="background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.25)" onclick="logout()">Logout</button>' +
        '<a href="/admin/dashboard.html" class="avatar" title="' + escapeHtml(name) + '" style="background:var(--gold);color:var(--royal-deep)">' + getInitials(name) + '</a>' +
        '</div></div></header>';
}

function renderAdminLayout(activePage, content) {
    return renderAdminHeader(activePage) + renderAdminSidebar(activePage) +
        '<div class="layout"><main class="main-content">' + content + '</main></div>';
}
