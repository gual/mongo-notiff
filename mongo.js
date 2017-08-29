var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var argv = require('minimist')(process.argv.slice(2));

var url = argv['connection-string'] ? argv['connection-string'] : 'mongodb://localhost:27017';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
	console.dir(argv);
	assert.equal(null, err);
	console.log("Connected successfully to server");

	db.close();
});
