'use strict';

const nodemailer = require('node4mailer');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var argv = require('minimist')(process.argv.slice(2));

var getParamOrDefault = function(key, defaultVal) { return argv[key] ? argv[key] : defaultVal };

var url = getParamOrDefault('connection-string', 'mongodb://localhost:27017');
var collectionName = getParamOrDefault('collection-name', 'test');
var key = getParamOrDefault('key', 'status');
var value = getParamOrDefault('value', 'OK');

var sendMail = function(transporterConfig, body) {
	var transporter = nodemailer.createTransport(transporterConfig);
	var to = getParamOrDefault('to', 'test@test.com');

	let mailOptions = {
		from: '"Error reporter" <error@reporter.org>',
		to: to,
		subject: 'Error report',
		text: body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
	});
};

var findDocuments = function(db) {
	var collection = db.collection(collectionName);
	var filterObject = {};
	filterObject[key] = value;

	collection.find(filterObject).toArray(function(err, docs) {
		assert.equal(err, null);
		var body = '';

		for (let doc of docs) {
			var name = doc.sentData.request.data.companyName
						? doc.sentData.request.data.companyName
						: 'Not found';
			var id = doc.sentData.id ? doc.sentData.id : 'Not found';
			body += "Business name: " + name + "/" + id + '\n';
		};

		if (argv['dev']) {
			//not working on nodev4 package
			nodemailer.createTestAccount((err, account) => {
				var transConfig = {
					host: 'smtp.ethereal.email',
					port: 587,
					secure: false,
					auth: {
						user: account.user,
						pass: account.pass
					}
				};
				sendMail(transConfig, body);
			});
		} else {
			var transConfig = {
				service: 'Gmail',
				auth: {
					user: argv['user'],
					pass: argv['pass']
				}
			};
			sendMail(transConfig, body);
		};
	});
};

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	findDocuments(db);
	db.close();
});
