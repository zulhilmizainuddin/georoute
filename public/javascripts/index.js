$(document).ready(function() {
    var map = new Mapping();
    map.initialize();

    $('#submit').click(function() {
        map.removeLayers();

        var domainName = $('#domainName').val();

        $.post('/trace', {domainName: domainName}, function(data, status) {
            if (status === 'success') {
                var destinationData = null;
                var hopData = [];

                var socket = io('/' + data.pid);
                socket
                    .on('connect', function() {
                        console.log('connected to server');
                    })
                    .on('connect_error', function() {
                        console.log('connection error, disconnecting socket');
                        socket.disconnect();
                    })
                    .on('destination', function(destination) {
                        destinationData = destination;
                    })
                    .on('data', function(data) {
                        console.log(data);

                        if (data.latitude !== '*' && data.longitude !== '*') {
                            hopData.push(data);

                            map.addMarker(data);
                            map.addPolylines(data);
                        }
                    })
                    .on('done', function () {
                        if (hopData[hopData.length - 1].ip !== destinationData.ip) {
                            map.addMarker(destinationData);
                            map.addPolylines(destinationData);
                        }

                        socket.disconnect();
                        console.log('done');
                    });
            }
        });
    });
});

var Mapping = function() {
    this.hopData = [];
};

Mapping.prototype.initialize = function() {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(this.map);
};

Mapping.prototype.removeLayers = function() {
    this.map.eachLayer(function(layer) {
        if (!layer._url) {
            this.map.removeLayer(layer);
        }
    }.bind(this));
};

Mapping.prototype.addMarker = function(data) {
    var marker = L.marker([data.latitude, data.longitude]).addTo(this.map);
    var popup = this.popupTemplate(data);

    marker.bindPopup(popup);
};

Mapping.prototype.popupTemplate = function(data) {
    var popup =
        '<b>' + 'Hop ' + data.hop + '</b><br>' +
        'RTT: ' + data.rtt1 + '<br>' +
        'City: ' + data.city + '<br>' +
        'Country: ' + data.country + '<br>' +
        'Latitude: ' + data.latitude + '<br>' +
        'Longitude: ' + data.longitude + '<br>';

    return popup;
};

Mapping.prototype.addPolylines = function(data) {
    this.hopData.push(data);

    this.polylinePoints = this.hopData.map(function(data) {
        return new L.LatLng(data.latitude, data.longitude);
    });

    if (this.polylines !== undefined) this.map.removeLayer(this.polylines);

    this.polylines = new L.Polyline(this.polylinePoints);

    this.map.addLayer(this.polylines);
    this.map.fitBounds(this.polylines.getBounds());
};