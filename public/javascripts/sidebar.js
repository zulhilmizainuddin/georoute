var Sidebar = function() {
    this.scrollCounter = 0;
    this.sidebar = null;
};

Sidebar.prototype.initialize = function(map) {
    this.sidebar = L.control.sidebar('sidebar', {position: 'right'}).addTo(map);
};

Sidebar.prototype.open = function() {
    this.sidebar.open('hopsPane');
};

Sidebar.prototype.tableTemplate = function(data) {
    return '<tr><td>' + template.hopTemplate(data) + '</td></tr>';
};

Sidebar.prototype.appendTable = function(data) {
    $('#hopsTable').append(this.tableTemplate(data));
    $('.sidebar-content').animate({scrollTop: this.scrollCounter += 500}, 1000);
};

Sidebar.prototype.clearTable = function() {
    this.scrollCounter = 0;
    $('#hopsTable').empty();
};