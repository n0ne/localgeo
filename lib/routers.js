Router.map(function () {
  this.route('home', {
    path: '/',
    template: 'map',
    onBeforeAction: function() {
      NProgress.configure({ showSpinner: false });
      var handle = Meteor.subscribe('markers');
      if(handle.ready()) {
          NProgress.done();
          markersGroup.addLayers(markers);
          map.addLayer(markersGroup);
      } else {
          NProgress.start();
          this.stop();
      }
    }
  });
});