$(document).ready(function() {
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

    $('#submit').click(function() {
        var domainName = $('#domainName').val();

        $.post('/trace', {'domainName': domainName}, function(data, status) {
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
                        console.log(destination);
                    })
                    .on('data', function(data) {
                        console.log(data);

                        if (data.latitude !== '*' && data.longitude !== '*') {
                            hopData.push(data);

                            var marker = L.marker([data.latitude, data.longitude]).addTo(map);

                            var popup =
                                '<b>' + 'Hop ' + data.hop + '</b>' + '<br>' +
                                'RTT: ' + data.rtt1 + '<br>' +
                                'City: ' + data.city + '<br>' +
                                'Country: ' + data.country + '<br>' +
                                'Latitude: ' + data.latitude + '<br>' +
                                'Longitude: ' + data.longitude + '<br>';

                            marker.bindPopup(popup);
                        }
                    })
                    .on('done', function () {
                        if (hopData[hopData.length -1].ip !== destinationData.ip) {
                            var marker = L.marker([destinationData.latitude, destinationData.longitude]).addTo(map);

                            var popup =
                                '<b>' + 'Hop ' + destinationData.hop + '</b>' + '<br>' +
                                'RTT: ' + destinationData.rtt1 + '<br>' +
                                'City: ' + destinationData.city + '<br>' +
                                'Country: ' + destinationData.country + '<br>' +
                                'Latitude: ' + destinationData.latitude + '<br>' +
                                'Longitude: ' + destinationData.longitude + '<br>';

                            marker.bindPopup(popup);
                        }

                        socket.disconnect();
                        console.log('done');
                    });
            }
        });
    });
});
