Meteor.startup(function () {

	Apm.connect('TQSLTNwMmakPkXqzd', '5ddb60d7-cf61-442e-a882-a8176e058afa');

	allMarkers._ensureIndex({location: "2dsphere"});

	Meteor.publish('markers', function(){
    	return allMarkers.find({});
	});
});