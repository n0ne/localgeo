markers = [];
insideMarkers = [];
diffMarkers = [];

activeIcon = L.icon({
  iconUrl: "packages/leaflet/images/marker-icon.png",
  shadowUrl: "packages/leaflet/images/marker-shadow.png",
  iconAnchor: [16, 37]
});


  


Meteor.startup(function() {

  Session.set('radius', 100);

  Deps.autorun(function() {

      var radius = Session.get('radius') ? Session.get('radius') : 100 ;
      var location  = Session.get('location');

      if(location) {
        insideMarkers =[];

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

        nearMarkers.forEach(function(m) {
          var lat = m.location.coordinates[1];
          var lng = m.location.coordinates[0];

          var marker = new L.Marker([lat, lng], {
            _id: m._id,
            icon: activeIcon
          }).on('click', function(e) {
              Session.set('location', [lng, lat]);
            });                                  

          insideMarkers.push(marker);
        });

        markersGroup.clearLayers(markers);
        markersGroup.addLayers(insideMarkers);
        map.addLayer(markersGroup);
      }
  });

});