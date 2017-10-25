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
	router.route('/user')
		.post(function(req, res) {

			res.setHeader('Access-Control-Allow-Origin', '*');
			console.log('NEW USER');
			console.log('id_thirdAuth is: ' + req.body.id_thirdAuth);

			var db = firebase.database();
			var refUser = db.ref("user");
			var id_thirdAuth = req.body.id_thirdAuth;

			var userExists = false;
			var userKey = null;

			//First check if the users already exists
			refUser.once('value', function(listUser) {

				if(listUser && listUser.val() !== null) {

 					// Find user in the list
 					for(var idUser in listUser.val()) {

 						// Verifica se id do usuario auth do firebase foi encontrado
 						if(id_thirdAuth === listUser.val()[idUser].id_thirdAuth) {
 							userExists = true;
 							userKey = idUser;
 						}
 					}
 				}

 				/*
				* New User.
				* thirdAuth can be any authentication provider(E.i.: Firebase Auth, Facebook)
				*/
				console.log('EITAAA')
 				if(!userExists) {
 					console.log('VALORES')
 					console.log(id_thirdAuth)
					var newUser = refUser.push({
						id_thirdAuth: id_thirdAuth,
						first_login: true
					}, function(error){
						if(error){
							console.log('DEU PAU AQUI')
							console.log(error);
							res.status(406).send();
						}
					});

					userKey = newUser.getKey();
 				}

 				// Generates a TOKEN for the user
				generateToken(userKey, function(code, token) {
					if(token) {
						var responseObj = {
							token: '',
							user_id: ''
						}

						responseObj.token = token;
						responseObj.user_id = userKey;
						res.status(200).json(JSON.stringify(responseObj));
					} else {
						res.status(406).send(null);
					}
				});
 			});
		})

		.get(function(req, res) {
			// Get query string parameter values
			var name = req.query.name;
			var limit = req.query.limit;

			// Get a database reference to users
			var db = firebase.database();
			var ref_users = db.ref("user");

			// Attach an asynchronous callback to read the data at our posts reference
			ref_users.once("value", function(listUser) {

 				if(listUser && listUser.val() !== null) {

 					// Check if it users query parameter to find by name
 					if(!name || typeof name === undefined) {
 						res.status(200).send(JSON.stringify(listUser.val()));
 					} else {
	 					name = name.toLowerCase();
	 					limit = Number(limit);

	 					// Default limit for the list is 10 users to improve performance
	 					limit = Number.isInteger(limit) && limit > 0 ? limit : 10;
	 					var listUsersFound = [];

	 					// blind iteration
						Object.keys(listUser.val()).forEach(function(idUser) {
  							var user = listUser.val()[idUser];

	 						if(user.name !== undefined) {

	 							console.log(user.name)
	 							console.log(name)

		 						// If the user' name start with the name searched then add to a list
		 						if(user.name.toLowerCase().startsWith(name)) {
		 							
		 							// Check if list is not full by checking the value of last item
		 							if(listUsersFound.length <= limit) {
		 								user.id = idUser;
		 								var userFound = user;
		 								userFound.id = idUser;

		 								listUsersFound.push(userFound);
		 							}
		 						}
	 						}
						});

						// Send response back
		 				res.status(200).send(JSON.stringify(listUsersFound));	
					}
				}
				else {
					res.status(200).send(null);
				}

			}, function (error) {
			 	res.status(200).send(false);
			});
		});

	//ROUTE
	router.route('/user/:id')
		.get(function(req, res) { // Get specific user
			console.log('GET SPECIFIC USER')

			// Get query string parameter values
			var idUser = req.params.id;
			var idLoggedUser = req.query.id_logged_user;

			// Get a database reference to users
			var db = firebase.database();
			var refUsers = db.ref("user/" + idUser);
			console.log('BOMB')
			console.log('user/' + idUser)

			// Attach an asynchronous callback to read the data at our posts reference
			refUsers.once("value", function(user) {
				console.log('DEBUG MASTEr')
 				if(user && user.val() !== null) {

 					console.log('DEBUG USER 1')

 					// Set the user id that does not come along with the result
 					var userFound = user.val();
 					userFound.id = idUser;

 					console.log('user/' + idLoggedUser + '/following/' + idUser)
 					
 					// If it receives idLoggedUser then check if the logged user has fallowed the user
 					if(idLoggedUser) {


 					console.log('DEBUG USER 2')

 						refFollowing = db.ref('user/' + idLoggedUser + '/following/' + idUser)
 						refFollowing.once("value", function(following) {
 							console.log('this the user 1: ' + userFound)
 							if(following && following.val()) {
 								res.status(200).send(JSON.stringify({ user: userFound, following_status: following.val() }));
 							} else {
 								res.status(200).send(JSON.stringify( {user: userFound, following_status: false } ));
 							}
 						});
 					} else {
 						console.log('this the user 2: ' + userFound)
		 				res.status(200).send(JSON.stringify( {user: userFound} ));
		 			}
				}
				else {
					res.status(200).send(null);
				}

			}, function (error) {
			 	res.status(200).send(false);
			});
		})

		.put(function(req, res) { // Update especific User
			console.log('UPDATE USER');
			res.setHeader('Access-Control-Allow-Origin', '*');

			var db = firebase.database();
			var refUser = db.ref("user/" + req.params.id);

			var objToUpdt = {
				name: req.body.name ? req.body.name : '',
				birthday: req.body.birthday ? req.body.birthday : '',
				desc: req.body.desc ? req.body.desc : '',
				contact: req.body.contact ? req.body.contact : ''
			}
			
			refUser.update(objToUpdt, function(error){
				if(error){
					console.log(error);
					res.status(406).send();
				} else {
					res.status(200).send();
				}
			});
		});

	//ROUTE
	router.route('/user/follow/:id')
		.put(function(req, res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			console.log('FOLLOW USER');
			console.log('User to follow: ' + req.params.id)
			console.log('My user: ' + req.body.id_user)

			var db = firebase.database();
			var refUser = db.ref('user/' + req.body.id_user);
			console.log('user/' + req.params.id)
			var refFollowing = refUser.child('following').child(req.params.id);
			
			refFollowing.set(true);
			return res.status(200).send();
		});

	//ROUTE
	router.route('/user/unfollow/:id')
		.put(function(req, res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			console.log('UNFOLLOW USER');

			var db = firebase.database();
			var refUser = db.ref('user/' + req.body.id_user);
			var refFollowing = refUser.child('following').child(req.params.id);
			
			refFollowing.remove();
			
			return res.status(200).send();
		});

	// [ROUTE]
	// router.route('/user/:id')
	// 	.get(function(req, res) {

	// 		// Get a database reference to users
	// 		var db = firebase.database();
	// 		var ref = db.ref("user/" + req.params.id);

	// 		// Attach an asynchronous callback to read the data at our posts reference
	// 		ref.on("value", function(snapshot) {
	// 		  //console.log(snapshot.val());
	// 		  res.json(snapshot.val());
	// 		}, function (errorObject) {
	// 		  console.log("The read failed: " + errorObject.code);
	// 		});
	// 	})

	// 	.put(function(req,res){
	// 		// Get a database reference to the occasion
	// 		var db = firebase.database();
	// 		var ref = db.ref("user/" + req.params.id);

	// 		// TODO - add other fields for the user info
	// 		ref.set({
	// 		  name: req.body.name
	// 		}, function(error){
	// 			if(error)
	// 				console.log(error);
	// 			res.status(200);
	// 		});
	// 	})

	// 	.delete(function(req, res) {
	// 		// Get a database reference to the occasion
	// 		var db = firebase.database();
	// 		var ref = db.ref("user/" + req.params.id);

	// 		var onComplete = function(error) {
	// 		  if (error) {
	// 		    res.status(204);
	// 		  } else {
	// 		    res.status(200);
	// 		  }
	// 		};

	// 		ref.remove(onComplete)
	// 	});

	// [ROUTE]
	router.route('/first-login')
		.get(function(req, res) {

			// Get query string parameter value
			var idUserFireFind = req.query.id_user_fire;

			// Get a database reference to users
			var db = firebase.database();
			var ref_users = db.ref('user');
			var ref_user = null;

			// Attach an asynchronous callback to read the data at our posts reference
			ref_users.once('value', function(listUser) {

				if(listUser && listUser.val() !== null) {

 					// Find user in the list
 					for(var idUser in listUser.val()) {

 						// Verifica se id do usuario auth do firebase foi encontrado
 						if(idUserFireFind === listUser.val()[idUser].id_thirdAuth) {
 							ref_user = db.ref("user/" + idUser);
 							break;
 						}
 					}

 					if(ref_user) {
 						//WARNING!!!
 						//**UNDO THIS FOR PRESENTATION**
 						//Set by default the user Layla to be the one followed by each new user
						//ref_user.child('following').child('-KoFoAL5fzxqctjslNj9').set(true);

 						ref_user.once('value', function(result) {

								// If it is not first login then respond false
								// otherwise update the attr and respond true
								var objResponse = {
									user_token: '',
									user_id: '',
									first_login: false
								}

								if(result.val().first_login) {
									ref_user.update({ first_login: false });
									objResponse.first_login = true;
								}

								// Generates a TOKEN for the user
								generateToken(idUser, function(code, token) {

									if(token) {
										objResponse.user_token = token;
										objResponse.user_id = idUser;
										
										return res.status(200).send(objResponse);
									} else {
										return res.status(406).send(null);
									}
								})
							});
 					}
 				} else {
 					res.status(200).send(false);
 				}
 			}, function (errorObject) {
 				console.log("The read failed: " + errorObject.code);
 				res.status(200).send(false);
 			});
		});


module.exports = router;