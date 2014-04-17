Meteor.startup(function () {

	if (!allMarkers.find().count())
      data.forEach(function (x) { allMarkers.insert(x); });

	allMarkers._ensureIndex({location: "2dsphere"});

	Meteor.publish('markers', function(){
    	return allMarkers.find({});
	});
});