var requestify = require('requestify'); 
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')
var crypto =  require('crypto');


var router = express.Router();

	// Check if the user token exists
	function validateToken(token, callback) {
		var db = firebase.database();
		var refUserToken = db.ref("user_token/" + token);

		console.log('url: ' + 'user_token/' + token)

		// Reference user_token
		db.ref('user_token/' + token).once('value').then(function(snapshot) {
			if(snapshot.val()) {
				callback(snapshot.val().id_user);	
			} else {
				callback(null);
			}
  		});
	}

	// [ROUTE]
	router.route('/recommendation/weather/16days') // Get Weather condition for next 16 days in Celsius

		.get(function(req, res) {

			validateToken(req.headers.authorization, function(idLoggedUser) {

				// If idUser is valid then the token was found
				if(idLoggedUser && idLoggedUser !== undefined) {
					var zipcode = req.query.zipcode;
					var country = req.query.country;

					console.log('http://api.openweathermap.org/data/2.5/forecast/daily?zip=' + zipcode + ',' + country + '&cnt=16&units=metric&APPID=38e36555d1b5e9d5d44c11e9cb9c4595')

					requestify.get('http://api.openweathermap.org/data/2.5/forecast/daily?zip=' + zipcode + ',' + country + '&cnt=16&units=metric&APPID=38e36555d1b5e9d5d44c11e9cb9c4595').then(function(response) {
						// Get the response body
						console.log(response.getBody())
						 res.status(200).json(response.getBody());
					});
				}
			});
		});
	


module.exports = router;