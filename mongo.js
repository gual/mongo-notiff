'use strict';

const nodemailer = require('nodemailer');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var argv = require('minimist')(process.argv.slice(2));

var getParamValueOrDefault = function(key, defaultValue) { return argv[key] ? argv[key] : defaultValue };

var url = getParamValueOrDefault('connection-string', 'mongodb://localhost:27017');
var collectionName = getParamValueOrDefault('collection-name', 'test');
var key = getParamValueOrDefault('key', 'status');
var value = getParamValueOrDefault('value', 'OK');

var findDocuments = function(db) {
  var collection = db.collection(collectionName);
  var filterObject = {};
  filterObject[key] = value;

  collection.find(filterObject).toArray(function(err, docs) {
	assert.equal(err, null);

	nodemailer.createTestAccount((err, account) => {
		let transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: account.user,
				pass: account.pass
			}
		});

		let mailOptions = {
			from: '"Fred Foo 👻" <foo@blurdybloop.com>',
			to: 'gual23@gmail',
			subject: 'Hello ✔',
			text: 'Found ' + docs.length + ' elements',
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: %s', info.messageId);
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		});
	});
  });
}

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	findDocuments(db);
	db.close();
});
