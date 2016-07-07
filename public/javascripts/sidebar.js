var sidebar = {
    scrollCounter: 0,
    sidebar: null,
    initialize: function(map) {
        this.sidebar = L.control.sidebar('sidebar', {position: 'right'}).addTo(map);
    },
    open: function() {
        this.sidebar.open('hopsPane');
    },
    tableTemplate: function(data) {
        return '<tr><td>' + template.hopTemplate(data) + '</td></tr>';
    },
    appendTable: function(data) {
        $('#hopsTable').append(this.tableTemplate(data));
        $('.sidebar-content').animate({scrollTop: this.scrollCounter += 500}, 1000);
    },
    clearTable: function() {
        this.scrollCounter = 0;
        $('#hopsTable').empty();
    }
};