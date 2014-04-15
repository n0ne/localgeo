

allMarkers = new Meteor.Collection('markers');

if (Meteor.isClient) {

  markers = [];
  insideMarkers = [];
  diffMarkers = [];



  Router.map(function () {
    this.route('home', {
      path: '/',
      template: 'map',
      before: function() {
        var handle = Meteor.subscribe('markers');
        if(handle.ready()) {
          NProgress.done();
          // console.log("handle.ready(): total markers: " + markers.length);
          markersGroup.addLayers(markers);
          map.addLayer(markersGroup);
        } else {
          NProgress.start();
          this.stop();
        }
      }
    });
  });



    activeIcon = L.icon({
      iconUrl: "packages/leaflet/images/marker-icon.png",
      shadowUrl: "packages/leaflet/images/marker-shadow.png",
      iconAnchor: [16, 37]
    });


  
  Template.map.rendered = function () {

    // console.log("Template.map.rendered");


    $(window).resize(function () {
      var h = $(window).height();
      var offsetTop = 50;

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

    // markersGroup;

    markersGroup = L.markerClusterGroup({
      maxClusterRadius: 100,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true
    });

    // allMarkers.find({location: {$near: { $geometry: { type: "Point", coordinates: [-122.41544999999999, 37.7745897] }, $maxDistance: 50 }}}).observe({
    allMarkers.find({}).observe({
      added: function (m) {
        var lat = m.location.coordinates[1];
        var lng = m.location.coordinates[0];

        var marker = new L.Marker([lat, lng], {
          _id: m._id,
          icon: activeIcon
        }).on('click', function(e) {
          Session.set('location', [lng, lat]);
          // console.log("Marker clicked. Location: " + Session.get('location'));

          markersGroup.clearLayers(markers);

        });
        markers.push(marker);
        

      }
    });
    // console.log("Total markers: " + markers.length);
    // Session.set('map', true)
  }

  Template.map.created = function() {
    // console.log("Created map. Total markers: " + markers.length);
  }

  Template.map.destroyed = function () {
    Session.set('map', false);
  }


  Template.map.events({
  "click #clear": function(e, t) {
    e.preventDefault();
    markersGroup.clearLayers(insideMarkers);

    markersGroup.addLayers(markers);
    map.addLayer(markersGroup);
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

  Meteor.startup(function() {
    // var radius = Session.get('radius') ? Session.get('radius') : 100 ;
    // var location = null;

    Deps.autorun(function() {

        var radius = Session.get('radius') ? Session.get('radius') : 100 ;
        var location  = Session.get('location');
        // console.log("From Deps.autorun: "+ location);

        // markersGroup.clearLayers(insideMarkers);

        if(location) {
          insideMarkers =[];
          // console.log("From Deps.autorun. If statement.");

          var nearMarkers = allMarkers.find({
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: location
                },
                $maxDistance: radius
              }
            }
          });

          // console.log("Total near markers " + nearMarkers.count());

          nearMarkers.forEach(function(m) {
            var lat = m.location.coordinates[1];
            var lng = m.location.coordinates[0];

            // console.log("Marker LatLng: " + [lat, lng]);

            var marker = new L.Marker([lat, lng], {
              _id: m._id,
              icon: activeIcon
            }).on('click', function(e) {
                Session.set('location', [lng, lat]);
              });                                  

            insideMarkers.push(marker);
          });

          // console.log("insideMarkers.length: " + insideMarkers.length);

          markersGroup.clearLayers(markers);
          markersGroup.addLayers(insideMarkers);
          map.addLayer(markersGroup);
        }
    });

  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    allMarkers._ensureIndex({location: "2dsphere"});

    Meteor.publish('markers', function(){
        return allMarkers.find({});
    });
  });
}
