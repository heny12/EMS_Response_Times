#! /usr/local/bin/node

var nn = require('nearest-neighbor');
var $ = jQuery = require('jquery');
var fs = require('fs');
var csv = require('./jquery.csv.min.js');
var kd = require('kdtree');
var prompt = require('prompt');

var fs = require('fs');
var readableStream = fs.createReadStream('full_firecalls_knn.csv');
var data = '';
 
readableStream.on('data', function(chunk) {
    data+=chunk;
});

// the structure that will perform the knn
var tree = new kd.KDTree(4);
//our test group and test answers
var test = [];
var testTypes = [];

readableStream.on('end', function() {
    //console.log(data);
   	var rawData = $.csv.toObjects(data);
   	//split defines how big train is to test
	var split = .67;

	// split up the raw data randomly by train/test
	for(i = 0; i < rawData.length; i++){
		var rand = Math.random();
		//we need to do some formating
		var old = rawData[i];
		var incident = [];
		//create a point
		var lat = parseFloat(old.lat);
		var lon = parseFloat(old.lon);
		//get the spatial point
		//var location = new Point(lat, lon);
		//get the time info
		var month = parseInt(old.month);
		var day = parseInt(old.day);
		//we don't care about year so we just want it to be the same
		var year = 2015;

		var incDate = new Date(year, month, day, 0, 0, 0, 0);
		var abDate = incDate.getTime();
		var incTime = parseInt(old.time);
		var incType = old.incType;

		if(rand < split) {
			tree.insert(lat, lon, abDate, incTime, incType);
		} else {
			var unType = ""
			test.push({"lat":lat, "lon":lon, "date":abDate, "time":incTime, "type":unType});
			testTypes.push(old.incType);
		}
	}

	// default k
	var uK = 13;
	testKNN(test, testTypes, tree, uK);

	prompt.start();

	// 
	// Get two properties from the user:
	// 
	prompt.get(['latitude', 'longitude', 'month', 'day', 'hour', 'minutes'], function (err, result) {
		// 
		// parse the results. 
		// 
		//run the test for k
		var uLat = parseFloat(result.latitude);
		var uLon = parseFloat(result.longitude);

		//date & time
		var uDate = new Date(2015, parseInt(result.month), parseInt(result.day), 0, 0, 0, 0).getTime();
		var uTime = (parseInt(result.hour) * 60) + parseInt(result.minutes);

		//construct query object
		var userQuery = {"lat":uLat, "lon":uLon, "date":uDate, "time":uTime, "type":"unknown"};

		// run prediction
		console.log(predictionK(userQuery, tree, uK));
	});
});

function testKNN(test, ans, tree, k){
	correct = 0;
	for (var i = test.length - 1; i >= 0; i--) {
		//get a prediction
		var pred = predictionK(test[i], tree, k);
		//see if it is correct
		if(pred == ans[i]){
			correct++;
		}
	};
	//log out the accuracy
	console.log("prediction accuracy: " + correct/ans.length);
}

function predictionK(query, tree, k){
	neighbors = tree.nearestRange(query.lat, query.lon, query.date, query.time, k);
	types = [];
	weights = [];
	for (var i = neighbors.length - 1; i >= 0; i--) {
		//get the type
		var curType = neighbors[i][4];
		//has type?
		var index = types.indexOf(curType);
		if(index < 0){
			types.push(curType);
			weights.push(1);
		} else {
			weights[index] = weights[index] + 1;
		}
	};

	var maxW = Math.max.apply(Math, weights);
	var pred = types[weights.indexOf(maxW)];

	return pred;
}

