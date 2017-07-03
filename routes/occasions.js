//var Movie = require('../models/movie');
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')

var router = express.Router();

//TEST - used to allow access from diferent IP locations
// router.use(function(req, res, next) {

// 	console.log('CONFIGURANDO HEADERS AQUI!!!!!')

//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
//   next();
// });

	// Check if the user token exists
	function validateToken(token, callback) {
		var db = firebase.database();
		var refUserToken = db.ref("user_token/" + token);

		console.log('url: ' + 'user_token/' + token)

		// Reference user_token
		db.ref('user_token/' + token).once('value').then(function(snapshot) {
			console.log('achou' + snapshot)
			if(snapshot.val()) {
				callback(snapshot.val().id_user);	
			}
			
			callback(null);
  		});
	}


	//ROUTE
	router.route('/occasions')
		//CREATE NEW OCCASION
		.post(function(req, res) {

			console.log('Start: NEW OCCASION CREATION');

			var db = firebase.database();
			var ref = db.ref("occasions");
 
			console.log(req.body);

			//If it came from Win App then normalize looks
			if(req.body.win_app !== null && req.body.win_app == true){
				console.log('HANDLE IT');
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

			console.log('CHECKPOINT 1');

			//New Occasion
			var newOccasion = ref.push({
			  name: req.body.name,
			  desc: req.body.desc,
			  mood: req.body.mood,
			  location: req.body.location,
			  date: req.body.date,
			  time: req.body.time,
			  url: req.body.url,
			  id_user: req.body.id_user
			}, function(error) {
				if(error) {

					console.log('CHECKPOINT 1.5');

					console.log(error);
					return res.status(500).send('Internal Server Error');
				}
				else {

					console.log('CHECKPOINT 2');

					//This is the just created occasion id
					idNewOccasion = newOccasion.key;
					console.log("NEW OCCASION ID: " + idNewOccasion);

					//If could create the Occasion 
					//add new Looks inside it
					var looks = req.body.looks;

					console.log('LOOKS TO BE SAVED');
					console.log(looks);

					//If it has looks then add along
					if(looks && looks.length) {

						looks.forEach(function(look) {
							//console.log(look);
							var newLook = newOccasion.child("looks").push({
							  	like: look.like,
							  	dislike: look.dislike,
							  	desc: look.desc,
							  	picture: look.picture,
								idForUpload: look.idForUpload
							}, function(error){
								if(error){
									countItLooks++;
									console.log(error);
									res.status(500).send('Internal Server Error');

									if(countItLooks === looks.length){
										console.log('LOG1')
										//return the new occasion id and its looks ids
										res.json({"id": idNewOccasion, "looks": listRespLooks, "msg": "OK", "idForUpload": newLook.idForUpload});	
									}
								}
								else{
									console.log('DEU CERTO AQUi')
									//console.log(look);
									countItLooks++;

									//Insert new look id into a list
									listRespLooks.push({ "id": newLook.key, "picture": look.picture, "idForUpload": look.idForUpload});

									if(countItLooks === looks.length){
										console.log('LOG3')
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

			console.log('GET OCCASIONS POSTS FROM FOLLOWING');

			// Get a database reference to our occasions
			var db = firebase.database();

			validateToken(req.headers.authorization, function(idUser){
				// If idUser is valid then the token was found
				if(idUser) {
					// First get the users the logged user is following
					var refFollowing = db.ref('user/' + req.headers.authorization + '/following');
					refFollowing.once('value', function(listFollowing){
						
						if(listFollowing && listFollowing.val()) {
	
 							for(var idUser in listFollowing.val()) {
 								// Get occasions posts from each user
 								// TODO - Get just the latest occasions posts
 								var refOccasions
 							}
						}
					});

					// Get all occasions linked to the user
					db.ref('occasions').once('value', function(response) {

					  if(response.val() === null){
					  	res.json(JSON.parse('{}'));
					  }
					  else {
					  	res.json(response.val());
					  }

					}, function (errorObject) {
					  console.log('The read failed: ' + errorObject.code);
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
 
			console.log(req.body);

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
				

module.exports = router;