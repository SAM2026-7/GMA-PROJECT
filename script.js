(function() {
    var path = window.location.pathname;
    if (path.indexOf('/submissions') === -1 && path.indexOf('/submissions.html') === -1) {
        window.location.href = '/index.html';
    }
})();
