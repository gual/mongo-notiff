'use strict';

const nodemailer = require('nodemailer');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var argv = require('minimist')(process.argv.slice(2));

var getParamOrDefault = function(key, defaultVal) { return argv[key] ? argv[key] : defaultVal };

var url = getParamOrDefault('connection-string', 'mongodb://localhost:27017');
var collectionName = getParamOrDefault('collection-name', 'test');
var key = getParamOrDefault('key', 'status');
var value = getParamOrDefault('value', 'OK');
var to = getParamOrDefault('to', 'test@test.com');

var smtpConf = {
	host: getParamOrDefault('host', 'smtp.ethereal.email'),
	port: getParamOrDefault('port', 587),
	user: argv['user'],
	pass: argv['pass']
}

var sendMail = function(transporterConfig, docs) {
	var transporter = nodemailer.createTransport(transporterConfig);

	let mailOptions = {
		from: '"Error reporter" <error@reporter.org>',
		to: to,
		subject: 'Error report',
		text: 'Found ' + docs.length + ' elements',
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

	var transporterConfig = { host: smtpConf.host, port: smtpConf.port, secure: false, auth: { } };

	if (smtpConf.user && smtpConf.pass) {
		transporterConfig.auth.user = smtpConf.user;
		transporterConfig.auth.pass = smtpConf.pass;
		sendMail(transporterConfig, docs)
	} else
		nodemailer.createTestAccount((err, account) => {
			transporterConfig.auth.user = account.user;
			transporterConfig.auth.pass = account.pass;
			sendMail(transporterConfig, docs)
		});
  });
};

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	findDocuments(db);
	db.close();
});
