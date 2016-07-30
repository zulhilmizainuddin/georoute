var Mapping = function() {
    this.markers = [];
    this.polylinePoints = [];
};

Mapping.prototype.initialize = function() {
    this.map = L.map('map', {
        center: [51.505, -0.09],
        zoom: 13,
        minZoom: 2
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(this.map);
};

Mapping.prototype.getMap = function() {
    return this.map;
};

Mapping.prototype.removeLayers = function() {
    this.map.eachLayer(function(layer) {
        if (!layer._url) {
            this.map.removeLayer(layer);
        }
    }.bind(this));
};

Mapping.prototype.addMarker = function(data) {
    var marker = L.marker([data.latitude, data.longitude], {icon: L.AwesomeMarkers.icon({text: data.hop})}).addTo(this.map);

    marker.bindPopup(template.hopTemplate(data)).openPopup();

    this.markers.push(marker);
};

Mapping.prototype.getMarkers = function() {
    return this.markers;
};

Mapping.prototype.addPolylines = function(data) {
    this.polylinePoints.push(new L.LatLng(data.latitude, data.longitude));

    if (this.polylinePoints.length > 1) {
        var locationA = this.polylinePoints[this.polylinePoints.length - 1];
        var locationB = this.polylinePoints[this.polylinePoints.length - 2];

        new L.Polyline([locationA, locationB]).addTo(this.map);
    }

    var polylines = new L.Polyline(this.polylinePoints);
    this.map.fitBounds(polylines.getBounds());
};

Mapping.prototype.clearData = function() {
    this.markers.length = 0;
    this.polylinePoints.length = 0;
};

Mapping.prototype.startProgressIndicator = function() {
    this.map.spin(true);
};

Mapping.prototype.stopProgressIndicator = function() {
    this.map.spin(false);
};