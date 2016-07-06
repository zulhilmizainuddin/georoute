var Mapping = function() {
    this.hopData = [];
    this.polylinePoints = null;
    this.polylines = null;
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

    marker.bindPopup(popup).openPopup();
};

Mapping.prototype.popupTemplate = function(data) {
    var popup =
        '<b>Hop ' + data.hop + '</b><br>' +
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

    if (this.polylines !== null) this.map.removeLayer(this.polylines);

    this.polylines = new L.Polyline(this.polylinePoints);

    this.map.addLayer(this.polylines);
    this.map.fitBounds(this.polylines.getBounds());
};

Mapping.prototype.clearData = function() {
    this.hopData = [];
    this.polylinePoints = null;
    this.polylines = null;
};

Mapping.prototype.startProgressIndicator = function() {
    this.map.spin(true);
};

Mapping.prototype.stopProgressIndicator = function() {
    this.map.spin(false);
};