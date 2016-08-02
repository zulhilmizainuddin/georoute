'use strict';

var template = {
    hopTemplate: function(data) {
        var template =
            '<b>Hop ' + data.hop + '</b><br>' +
            'IP: ' + data.ip + '<br>' +
            'RTT: ' + data.rtt1 + '<br>' +
            'City: ' + data.city + '<br>' +
            'Country: ' + data.country + '<br>' +
            'Latitude: ' + data.latitude + '<br>' +
            'Longitude: ' + data.longitude + '<br>';

        return template;
    }
};
