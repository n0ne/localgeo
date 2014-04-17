  Template.map.rendered = function () {

  $(window).resize(function () {
    var h = $(window).height();
    var offsetTop = 120;

    $('#map_canvas').css('height', (h - offsetTop));

  }).resize();

  // console.log("Init map");
  map = L.map($('#map_canvas')[0], {
    scrollWheelZoom: true,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false
  }).setView(new L.LatLng(37.7745897, -122.41544999999999), 13);

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://cloudmade.com\">CloudMade</a>"
  }).addTo(map);

  map.attributionControl.setPrefix("");

  markersGroup = L.markerClusterGroup({
    maxClusterRadius: 100,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true
  });
  allMarkers.find({}).observe({
    added: function (m) {
      var lat = m.location.coordinates[1];
      var lng = m.location.coordinates[0];

      var marker = new L.Marker([lat, lng], {
        _id: m._id,
        icon: activeIcon
      }).on('click', function(e) {
        Session.set('location', [lng, lat]);

        markersGroup.clearLayers(markers);

      });
      markers.push(marker);
      

    }
  });
}

Template.map.events({
  "click #clear": function(e, t) {
    e.preventDefault();
    markersGroup.clearLayers(insideMarkers);

    markersGroup.addLayers(markers);
    map.addLayer(markersGroup);

    Session.set('radius', 100);
    Session.set('location', undefined);
  },

  "click #100m": function(e, t) {
    e.preventDefault();
    Session.set('radius', 100);
  },
  "click #500m": function(e, t) {
    e.preventDefault();
    Session.set('radius', 500);
  },
  "click #1000m": function(e, t) {
    e.preventDefault();
    Session.set('radius', 1000);
  }
});

Template.map.helpers({
  radius100m: function() {
    return Session.equals("radius", 100);
  },
  radius500m: function() {
    return Session.equals("radius", 500);
  },
  radius1000m: function() {
    return Session.equals("radius", 1000);
  }
});