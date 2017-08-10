var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')

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


	//ROUTE
	router.route('/occasions')
		//CREATE NEW OCCASION
		.post(function(req, res) {

			console.log('Start: NEW OCCASION CREATION');

			var db = firebase.database();
			var ref = db.ref("occasions");

			//If it came from Win App then normalize looks
			if(req.body.win_app !== null && req.body.win_app == true){
				var normalizedListLooks = [];
				req.body.looks = JSON.parse(req.body.looks);

				for(var i = 0; i < req.body.looks.length; i++){
					normalizedListLooks.push(JSON.parse(req.body.looks[i]));
				}

				req.body.looks = normalizedListLooks;
			}

			var idNewOccasion = 0;
			var listRespLooks = [];
			var countItLooks = 0;

			//New Occasion
			var newOccasion = ref.push({
			  name: req.body.name,
			  desc: req.body.desc,
			  mood: req.body.mood,
			  location: req.body.location,
			  date: req.body.date,
			  date_expire: req.body.date_expire,
			  time: req.body.time,
			  url: req.body.url,
			  id_user: req.body.id_user
			}, function(error) {
				if(error) {
					console.log(error);
					return res.status(500).send('Internal Server Error');
				}
				else {
					//This is the just created occasion id
					idNewOccasion = newOccasion.key;

					//If could create the Occasion 
					//add new Looks inside it
					var looks = req.body.looks;

					//If it has looks then add along
					if(looks && looks.length) {

						looks.forEach(function(look) {
							//console.log(look);
							var newLook = newOccasion.child("looks").push({
							  	like: 0,
							  	dislike: 0,
							  	desc: look.desc,
							  	picture: look.picture,
								idForUpload: look.idForUpload,
								comments: ''
							}, function(error){
								if(error){
									countItLooks++;
									console.log(error);
									res.status(500).send('Internal Server Error');

									if(countItLooks === looks.length){
										//return the new occasion id and its looks ids
										res.json({"id": idNewOccasion, "looks": listRespLooks, "msg": "OK", "idForUpload": newLook.idForUpload});	
									}
								}
								else{
									//console.log(look);
									countItLooks++;

									//Insert new look id into a list
									listRespLooks.push({ "id": newLook.key, "picture": look.picture, "idForUpload": look.idForUpload});

									if(countItLooks === looks.length){
										//return the new occasion id and its looks ids
										res.json({"id": idNewOccasion, "looks": listRespLooks, "msg": "OK"}).send();
									}
								}
							});
						});
					}
					else { //Insert empty list of looks
						var newLook = newOccasion.child("looks").push([], function(error) {
							if(error) {
								console.log(error);
								res.status(500).send('Internal Server Error');
							}
							else {
								res.json({"id": idNewOccasion, "looks": [], "msg": "OK"});
							}
						});
					}
				}
			});
		})

		//GET ALL OCCASIONS
		.get(function(req, res) { // GET OCCASIONS POSTS FROM FOLLOWING
			"use strict"; // Dot not remove it, required since i am using 'let' inside this function

			console.log('GET OCCASIONS POSTS FROM FOLLOWING');

			// Get a database reference to our occasions
			var db = firebase.database();

			validateToken(req.headers.authorization, function(idLoggedUser) {

				// If idUser is valid then the token was found
				if(idLoggedUser && idLoggedUser !== undefined) {

					// First get the users the logged user is following
					var refFollowing = db.ref('user/' + idLoggedUser + '/following');
					refFollowing.once('value', function(listFollowing) {

						if(listFollowing && listFollowing.val()) {
							var resListOccasions = [];

							// Iterate over users the logged one is following
 							for(var idUser in listFollowing.val()) {

 								// Get occasions posts from each user
 								// TODO - Get just the latest occasions posts
 								var counter = 0; // Used to check if reached 9 occasions as response
 								var refOccasions = db.ref('occasions');

 								refOccasions.once('value', function(listOccasion) {

 									if(listOccasion && listOccasion.val() && Object.keys(listOccasion.val()).length > 0) {

 										for(var idOccasion in listOccasion.val()) {
 											var resOccasion = listOccasion.val()[idOccasion];

 											if(resOccasion.id_user === idUser) {
 												counter++;
 												resOccasion.id = idOccasion;
 												resOccasion.name_user = '';
 												resListOccasions.push(resOccasion);
 											}

 											// Send response when reach 10 items or before when reaches the end
 											if(counter === 9) {
 												break;
 											}
 										}

 										if(resListOccasions.length === 0) {
 											return res.status(200).json(null);
 										}

 										// Iteration the get the user name
 										var counter2 = 0;
 										for(let i = 0; i < resListOccasions.length; i++) {
 											//var cloneOfA = JSON.parse(JSON.stringify(resListOccasions[i])); 
	 										var refFollowing = db.ref('user/' + resListOccasions[i].id_user + '/name');
	 										refFollowing.once('value', function(userName) {
	 											counter2++;
	 											
	 											if(resListOccasions[i] !== undefined) {
	 												resListOccasions[i].name_user = userName.val();
	 											}
	 											
	 											if(counter2 === resListOccasions.length) {
	 												return res.status(200).send(JSON.stringify(resListOccasions));
	 											} 
	 										});
 										}
 									} else {
 										res.status(200).json(null);
 									}
 								});
 							}
						} else {
							res.status(200).json(null);
						}
					});
				}
			})
		})

		//DELETE ALL OCCASIONS
		.delete(function(req, res) {

			console.log('Start: DELETE ALL OCCASIONS');

			// Get a database reference to our occasions
			var db = firebase.database();
			var ref = db.ref('occasions');

			ref.remove(
				function(error) {
				  if (error) {
				     res.status(204).send('Internal Server Error')
				  } else {
				    res.status(200);
				  }
				});
		})

	//ROUTE
	router.route('/occasions/:id')
		//GET SPECIFIC OCCASION
		.get(function(req, res) {

			console.log('Start: GET SPECIFIC OCCASION');

			// Get a database reference to our posts
			var db = firebase.database();
			var ref = db.ref("occasions/" + req.params.id);

			// Attach an asynchronous callback to read the data at our posts reference
			ref.on("value", function(snapshot) {
			  //console.log(snapshot.val());
			  res.json(snapshot.val());
			}, function (errorObject) {
			  console.log("The read failed: " + errorObject.code);
			});
		})

		//UPDATE SPECIFIC OCCASION
		.put(function(req,res){

			console.log('Start: UPDATE SPECIFIC OCCASION');

			// Get a database reference to the occasion
			var db = firebase.database();
			var ref = db.ref("occasions/" + req.params.id);

			ref.set({
			  name: req.body.name,
			  desc: req.body.desc,
			  mood: req.body.mood,
			  location: req.body.location,
			  date: req.body.date,
			  time: req.body.time,
			  url: req.body.url,
			  looks: req.body.looks
			}, function(error){
				if(error){
					console.log(error);
				}
				res.status(200);
			});
		})

		//DELETE SPECIFIC OCCASION
		.delete(function(req, res) {

//test
			console.log('Start: DELETE SPECIFIC OCCASION');

			//Get a database reference to the occasion
			var db = firebase.database();
			var ref = db.ref("occasions/" + req.params.id);

			ref.remove(
				function(error) {
				  if (error) {
				    res.status(204);
				  } else {
				    res.status(200);
				  }
				});
		});

	//ROUTE
	router.route('/reactions')
		//CREATE NEW OCCASION
		.post(function(req, res) {

			console.log('Start: NEW REACTION');

			var db = firebase.database();
			var ref = db.ref("occasions/<idoccasion>/looks/<idlook>");
 
			var newReaction = ref.child("reactions").push({
				user:    req.body.userid,
				like:    req.body.like,
				comment: req.body.comment
			}, function(error){
				if (error) {
				    res.status(500).send('Internal Server Error')
				} else {
					res.status(200);
				}
			});
	});

		//ROUTE
	router.route('/occasion/list/active')

		.get(function(req, res) { // Get active occasions

			console.log('GET ACTIVE OCCASIONS');

			// Get a database reference to our posts
			var db = firebase.database();
			var refOccasions = db.ref('occasions');

			refOccasions.once('value', function(listOccasion) {

				if(listOccasion && listOccasion.val()) {
					var resListOccasion = [];
					var currentDateTime = new Date().getTime();
					var idUser = req.query.id_user;
					var count = 0;

					if(Object.keys(listOccasion.val()).length > 0) {

								// Iterate over users the logged one is following
								for(var idOccasion in listOccasion.val()) {
									count++;
									var occasion = listOccasion.val()[idOccasion];
									occasion.id = idOccasion;

	 								// Find the occasions that expiration date are under the current date
	 								if(idUser === occasion.id_user && currentDateTime <= occasion.date_expire) {
	 									resListOccasion.push(occasion);
	 								}
	 							}

	 							if(resListOccasion.length === 0) {
	 								resListOccasion = null;
	 							}
	 							
	 							res.status(200).json(resListOccasion);
	 				} else {
	 					res.status(200).send(null);
	 				}
	 			} else {
	 				res.status(200).send(null);
	 			}
	 		});			
		});

	//ROUTE
	router.route('/occasion/list/inative')

		.get(function(req, res) { // Get previous/inactive occasions

			console.log('GET PREVIOUS/INATIVE OCCASIONS');

			// Get a database reference to our posts
			var db = firebase.database();
			var refOccasions = db.ref('occasions');

			refOccasions.once('value', function(listOccasion) {

				if(listOccasion && listOccasion.val()) {
					var resListOccasion = [];
					var currentDateTime = new Date().getTime();
					var idUser = req.query.id_user;
					var count = 0;

					if(Object.keys(listOccasion.val()).length > 0) {

								// Iterate over users the logged one is following
								for(var idOccasion in listOccasion.val()) {
									count++;
									var occasion = listOccasion.val()[idOccasion];
									occasion.id = idOccasion;

	 								if(idUser === occasion.id_user && occasion.date_expire < currentDateTime ) {
	 									resListOccasion.push(occasion);
	 								}
	 							}

	 							if(resListOccasion.length === 0) {
	 								resListOccasion = null;
	 							}

	 							console.log('here1')
	 							console.log(resListOccasion)
	 							
	 							res.status(200).json(resListOccasion);
	 				} else {
	 					console.log('here2')
	 					res.status(200).send(null);
	 				}
	 			} else {
	 				console.log('here3')
	 				res.status(200).send(null);
	 			}
	 		});			
		});	
				

module.exports = router;