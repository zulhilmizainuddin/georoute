var sidebar = {
    scrollCounter: 0,
    initialize: function() {
        this.scrollCounter = 0;
        $('#hopsTable').empty();
    },
    tableTemplate: function(data) {
        return '<tr><td>' + template.hopTemplate(data) + '</td></tr>';
    },
    appendTable: function(data) {
        $('#hopsTable').append(this.tableTemplate(data));
        $('.sidebar-content').animate({scrollTop: this.scrollCounter += 500}, 1000);
    }
};