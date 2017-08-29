'use strict';

const nodemailer = require('nodemailer');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var argv = require('minimist')(process.argv.slice(2));

var url = argv['connection-string'] ? argv['connection-string'] : 'mongodb://localhost:27017';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected successfully to server");

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
	        text: 'Hello world?',
	        html: '<b>Hello world?</b>'
	    };

	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	            return console.log(error);
	        }
	        console.log('Message sent: %s', info.messageId);
	        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	    });
	});

	db.close();
});
