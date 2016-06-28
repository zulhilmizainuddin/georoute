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
                        console.log('destination: ' + destination);
                    })
                    .on('data', function(data) {
                        console.log(data);
                    })
                    .on('done', function () {
                        socket.disconnect();
                        console.log('done');
                    });
            }
        });
    });
});
