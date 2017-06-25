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
	router.route('/user')
		.post(function(req, res) {

			res.setHeader('Access-Control-Allow-Origin', '*');

			console.log('NEW USER');
			console.log(req)

			var db = firebase.database();
			var refUser = db.ref("user");

			/*
			* New User.
			* thirdAuth can be any authentication provider(E.i.: Firebase Auth, Facebook)
			*/
			var newUser = refUser.push({
			  id_thirdAuth: req.body.id_thirdAuth,
			  first_login: true
			}, function(error){
				if(error){
					console.log(error);
					res.status(406).send();
				}
			});

			var responseObj = {
				token: '',
				user_id: ''
			}

			// Generates a TOKEN for the user
			generateToken(newUser.getKey(), function(code, token){
				if(token) {
					responseObj.token = token;
					responseObj.user_id = newUser.getKey();
					res.status(200).send(responseObj);
				} else {
					res.status(406).send(null);
				}
			})
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

	 					// Find user in the list
	 					for(var idUser in listUser.val()) {

	 						if(listUser.val()[idUser].name !== undefined) {

		 						// If the user' name start with the name searched then add to a list
		 						if(listUser.val()[idUser].name.toLowerCase().startsWith(name)) {
		 							
		 							// Check if list is not full by checking the value of last item
		 							if(listUsersFound.length <= limit) {
		 								listUser.val()[idUser].id = idUser;
		 								var userFound = listUser.val()[idUser];
		 								userFound.id = idUser;
		 								listUsersFound.push(userFound);
		 							}
		 						}
	 						}
						}

						res.status(200).send(JSON.stringify(listUsersFound));
					}
				}
				else {
					res.status(200).send(null);
				}

			}, function (error) {
			 	res.status(200).send(false);
			});
		})

	//ROUTE
	router.route('/user/:id')
		.put(function(req, res) {

			res.setHeader('Access-Control-Allow-Origin', '*');

			console.log('UPDATE USER');

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
			console.log(req.body)

			var db = firebase.database();
			var refUser = db.ref('user/' + req.body.id_user);
			var refFollowing = refUser.child('following/' + req.params.id);
			
			refFollowing.setValue(true);
			res.status(200).send();
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
			var ref_users = db.ref("user");

			// Attach an asynchronous callback to read the data at our posts reference
			ref_users.once("value", function(listUser) {

 				if(listUser && listUser.val() !== null) {

 					// Find user in the list
 					for(var idUser in listUser.val()) {

 						// Verifica se id do usuario auth do firebase foi encontrado
						if(idUserFireFind === listUser.val()[idUser].id_thirdAuth) {

							var ref_user = db.ref("user/" + idUser);

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
								generateToken(idUser, function(code, token){
									if(token) {
										objResponse.user_token = token;
										objResponse.user_id = idUser;
										res.status(200).send(objResponse);
									} else {
										res.status(406).send(null);
									}
								})
							});
						}
					}
				}
				else {
					res.status(200).send(false);
				}

			}, function (errorObject) {
			  console.log("The read failed: " + errorObject.code);
			  res.status(200).send(false);
			});
		})


module.exports = router;