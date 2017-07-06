//var Movie = require('../models/movie');
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')
var crypto =  require('crypto');


var router = express.Router();

	// Generate token and save it on 
	function generateToken(idUser, callback) {
		var token = crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
		
		// Create User Token and send response with this generated token
		var db = firebase.database();
		var refUserToken = db.ref("user_token/" + token);
		refUserToken.set({
						id_user: idUser
					}, function(error){
						if(error){
							console.log(error);
							//res.status(406).send();
							callback(406, null);
						}
						else{
							//res.status(200).send(token);
							callback(200, token);
						}
					});
	}

	// [ROUTE]
	router.route('/look/like/:id_occasion/:id_look')

		.put(function(req, res) { // Like a Look
			console.log('LIKE LOOK');
			res.setHeader('Access-Control-Allow-Origin', '*');

			var db = firebase.database();
			var refLook = db.ref("occasions/" + req.params.id_occasion + '/' + req.params.id_look + '/like');
			
			refLook.once("value", function(like) {
				if(like && like.val()) {
					console.log('AMOUNT OF LIKE: ' + like.val());
				}
			});

		});



module.exports = router;