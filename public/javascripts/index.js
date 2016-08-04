'use strict';

$(document).ready(function() {
    var map = new Mapping();
    map.initialize();

    var sidebar = new Sidebar(map.getMarkers());
    sidebar.initialize(map.getMap());

    $('#submit').click(function() {

        var domainName = $('#domainName').val();

        if (!validator.isFQDN(domainName + '') && !validator.isIP(domainName + '')) {
            console.log('invalid input: ' + domainName);

            toastr.options = {
              closeButton: true,
              debug: false,
              newestOnTop: false,
              progressBar: true,
              positionClass: 'toast-top-right',
              preventDuplicates: true,
              onclick: null,
              showDuration: 300,
              hideDuration: 1000,
              timeOut: 2000,
              extendedTimeOut: 1000,
              showEasing: 'swing',
              hideEasing: 'linear',
              showMethod: 'fadeIn',
              hideMethod: 'fadeOut'
            };

            toastr.error('Input a domain name or ip address');

            return;
        }

        map.clearData();
        map.removeLayers();

        sidebar.clearTable();

        $.post('/trace', {domainName: domainName}, function(data, status) {
            if (status === 'success') {
                var destinationData = null;
                var hopData = [];

                var socket = io('/' + data.guid);
                socket
                    .on('connect', function() {
                        console.log('connected to server');

                        map.startProgressIndicator();
                        sidebar.open();
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

                        sidebar.appendTable(data);
                    })
                    .on('done', function() {
                        if (hopData[hopData.length - 1].ip !== destinationData.ip) {
                            map.addMarker(destinationData);
                            map.addPolylines(destinationData);

                            sidebar.appendTable(destinationData);
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

    $('[data-toggle="popover"]').popover();

    $('#domainName').keypress(function(e) {
        if (e.keyCode === 13) {
            $('#submit').click();
        }
    });
});