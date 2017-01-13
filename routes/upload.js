
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')

var router = express.Router();
var rootPath = '/upload';

	//ROUTE
	router.route(rootPath + '/look')
		//UPLOAD LOOK
		.post(function(req, res) {

			console.log('Start: upload look');

			console.log(req.body);

			var imageBase64 = ""; //TODO receive the strinBase64 image
			
		});
		

module.exports = router;