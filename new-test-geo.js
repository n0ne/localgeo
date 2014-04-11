// map = null

allMarkers = new Meteor.Collection('markers');
// allMarkers._ensureIndex({location: "2dsphere"});

if (Meteor.isClient) {

  markers = [];
  insideMarkers = [];
  diffMarkers = [];

  removeMarker = function(marker) {

    map.removeLayer(markersGroup);

    // markers.forEach(function(_id) {
    //   var marker = markers[_id];

    //   markers.forEach(function(m) {
    //     if(m.options._id !== _id) {
    //       markersGroup.removeLayer(m);
    //     }
    //   });

    // });


  }

  // var activeIcon;

    activeIcon = L.icon({
      iconUrl: "packages/leaflet/images/marker-icon.png",
      shadowUrl: "packages/leaflet/images/marker-shadow.png",
      iconAnchor: [16, 37]
    });


  
  Template.map.rendered = function () {

    console.log("Template.map.rendered");


    $(window).resize(function () {
      var h = $(window).height();
      var offsetTop = 50;

      $('#map_canvas').css('height', (h - offsetTop));

    }).resize();

    console.log("Init map");
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
      zoomToBoundsOnClick: true
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
          map.panTo(e.target.getLatLng());
          // console.log("Total markers array size: " + markers.length);
          // console.log(e);
          // removeMarker(e.target.options._id);
          map.removeLayer(markersGroup);

        });

        // map.addLayer(marker);

        // markersGroup.addLayer(marker);

        markers.push(marker);
        // markers[marker.options._id] = marker;
         // console.log(markers[marker.options._id]);

        // map.addLayer(markersGroup);

        // console.log("Lat: " + m.location.coordinates[1] + ", Lng: " + m.location.coordinates[0]);
        // var marker = L.Marker([m.location.coordinates[1], m.location.coordinates[0]], {
        //   _id: m._id,
        //   icon: activeIcon
        // });

        // map.addLayer(marker);

      }
    });
    if(DDP._allSubscriptionsReady()) {
      console.log("DDP: total markers: " + markers.length);
      markersGroup.addLayers(markers);
      map.addLayer(markersGroup);
    }
    console.log("Total markers: " + markers.length);
    Session.set('map', true)
  }

  Template.map.created = function() {
    console.log("Created map. Total markers: " + markers.length);
  }

  Template.map.destroyed = function () {
    Session.set('map', false);
  }


  Template.map.events({
  "click #clear": function(e, t) {
    e.preventDefault();

    map.removeLayer(markersGroup);

    Session.set('clear', true);
  }
});

  Meteor.startup(function() {
    // var radius = Session.get('radius') ? Session.get('radius') : 100 ;
    // var location = null;

    Deps.autorun(function() {
      // var isMap = Session.get('map');
      // if(isMap) {
        // radius    = Session.get('radius');
        // diffMarkers = [];

        var location  = Session.get('location');
        console.log(location);
        // var nearMarkers = null;

        // map.removeLayer(markersGroup);

        markersGroupNew = L.markerClusterGroup({
          maxClusterRadius: 100,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        });

        var activeIcon;

        activeIcon = L.icon({
          iconUrl: "packages/leaflet/images/marker-icon.png",
          shadowUrl: "packages/leaflet/images/marker-shadow.png",
          iconAnchor: [16, 37]
        });

        if(location) {
          console.log("New  location: " + location);
          // console.log("Radius: " + radius);
          
          var nearMarkers = allMarkers.find({ location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: location
                },
                $maxDistance: 100
              }
          }});
          console.log("Total markers " + nearMarkers.count());
          console.log(nearMarkers);

          nearMarkers.forEach(function(m) {

            var lat = m.location.coordinates[1];
            var lng = m.location.coordinates[0];

            var marker = new L.Marker([lat, lng], {
              _id: m._id,
              icon: activeIcon
            }).on('click', function(e) {
              Session.set('location', [lng, lat]);
              map.panTo(e.target.getLatLng());
              // console.log("Total markers array size: " + markers.length);
              // console.log(e);
              removeMarker(e.target.options._id);

            });

        // map.addLayer(marker);

            markersGroupNew.addLayer(marker);

            // markers.push(marker);
            // markers[marker.options._id] = marker;
             // console.log(markers[marker.options._id]);

            map.addLayer(markersGroupNew);





            // console.log(m);
            

            // var lat = m.location.coordinates[1];
            // var lng = m.location.coordinates[0];

            // var marker = new L.Marker([lat, lng], {
            //   _id: m._id,
            //   icon: activeIcon
            // }).on('click', function(e) {
            //   Session.set('location', [lng, lat]);
            //   console.log("Total markers array size: " + markers.length);

            // });

            // // insideMarkers.push(marker);
            // insideMarkers[marker.options._id] = marker;

        
          });

          // diffMarkers = _.difference(markers, insideMarkers);
          // console.log("Total markers to hide: " + diffMarkers.length);          
          // diffMarkers = []

          // console.log("Markers inside circle: " + insideMarkers.length);
          // insideMarkers = []


        }

      // }

    });

    Deps.autorun(function() {

      if(Session.get('clear')){

        console.log(Session.get('clear'));

        markersGroup = L.markerClusterGroup({
          maxClusterRadius: 100,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        });

        var activeIcon;

        activeIcon = L.icon({
          iconUrl: "packages/leaflet/images/marker-icon.png",
          shadowUrl: "packages/leaflet/images/marker-shadow.png",
          iconAnchor: [16, 37]
        });

        var clearMarkers = allMarkers.find({});
        

        clearMarkers.forEach(function(m) {

          var lat = m.location.coordinates[1];
          var lng = m.location.coordinates[0];

          var marker = new L.Marker([lat, lng], {
            _id: m._id,
            icon: activeIcon
          }).on('click', function(e) {
            Session.set('location', [lng, lat]);
            map.panTo(e.target.getLatLng());
            removeMarker(e.target.options._id);

          });

          markersGroup.addLayer(marker);
          map.addLayer(markersGroup);
        });

        

      } else {

        Session.set('clear', false);

      }
      

    });
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    allMarkers._ensureIndex({location: "2dsphere"});
  });
}
