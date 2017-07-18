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

	function undoDislike() {
		// TODO - implement
	}

	function undoDislike() {
		// TODO - implement
	}

	// [ROUTE]
	router.route('/look/like/:id_occasion/:id_look')

		.put(function(req, res) { // Like a Look
			console.log('LIKE LOOK');
			res.setHeader('Access-Control-Allow-Origin', '*');

			// TODO
			/*var undoDislike = req.query.undo_dislike;
			if(undo_dislike) {
				undoDislike();
			}*/

			var db = firebase.database();
			var refLook = db.ref("occasions/" + req.params.id_occasion + '/looks/' + req.params.id_look + '/like');

			refLook.transaction(function (current_value) {
			  return (current_value || 0) + 1;
			}, function(error) {

				// If no error save register of user reaction to a look
				if(!error) {
					var refLookReaction = db.ref('user_look_reaction/' + req.params.id_look + '/' + req.body.id_user);
					var objToUpdt = {
						like: true,
						date: new Date().getTime()
					}

					// Store reaction on look
					refLookReaction.update(objToUpdt, function(error){
						if(!error) {
							res.status(200).send(true);
						} else {
							// If there a error then try to undo the first operation
							refLook.transaction(function (current_value) {
							  return (current_value || 0) - 1;
							}, function(error){
								res.status(200).send(false);
							});
						}
					});
				} else {
					res.status(200).send(false);
				}
			});
		});

	// [ROUTE]
	router.route('/look/dislike/:id_occasion/:id_look')

		.put(function(req, res) { // Dislike a Look
			console.log('DISLIKE LOOK');
			res.setHeader('Access-Control-Allow-Origin', '*');

			// TODO
			/*var undoLike = req.query.undo_like;
			if(undo_like) {
				undoLike();
			}*/

			var db = firebase.database();
			var refLook = db.ref('occasions/' + req.params.id_occasion + '/looks/' + req.params.id_look + '/dislike');

			refLook.transaction(function (current_value) {
			  return (current_value || 0) + 1;
			}, function(error) {

				// If no error save register of user reaction to a look
				if(!error) {
					var refLookReaction = db.ref('user_look_reaction/' + req.params.id_look + '/' + req.body.id_user);
					var objToUpdt = {
						like: false,
						date: new Date().getTime()
					}

					// Store reaction on look
					refLookReaction.update(objToUpdt, function(error){
						if(!error) {
							res.status(200).send(true);
						} else {
							// If there a error then try to undo the first operation
							refLook.transaction(function (current_value) {
								return (current_value || 0) - 1;
							}, function(error) {
								res.status(200).send(false);
							});
						}
					});
				} else {
					res.status(200).send(false);
				}
			});
		});




module.exports = router;