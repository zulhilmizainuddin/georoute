$(document).ready(function() {
    var map = new Mapping();
    map.initialize();

    $('#submit').click(function() {
        map.clearData();
        map.removeLayers();

        var domainName = $('#domainName').val();

        $.post('/trace', {domainName: domainName}, function(data, status) {
            if (status === 'success') {
                var destinationData = null;
                var hopData = [];

                var socket = io('/' + data.guid);
                socket
                    .on('connect', function() {
                        console.log('connected to server');

                        map.startProgressIndicator();
                    })
                    .on('connect_error', function() {
                        console.log('connection error, disconnecting socket');
                        socket.disconnect();

                        map.stopProgressIndicator();
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
                    .on('done', function() {
                        if (hopData[hopData.length - 1].ip !== destinationData.ip) {
                            map.addMarker(destinationData);
                            map.addPolylines(destinationData);
                        }

                        console.log('disconnecting from server');
                        socket.disconnect();

                        map.stopProgressIndicator();

                        console.log('done');
                    })
                    .on('terminated', function() {
                        console.log('disconnecting from server');
                        socket.disconnect();

                        map.stopProgressIndicator();

                        console.log('terminated');
                    });
            }
        });
    });

    $('#domainName').keypress(function(e) {
        if (e.keyCode === 13) {
            $('#submit').click();
        }
    });
});