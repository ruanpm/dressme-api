//var Movie = require('../models/movie');
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')


var router = express.Router();

	// [ROUTE]
	router.route('/user')
		.post(function(req, res) {

			res.setHeader('Access-Control-Allow-Origin', '*');

			console.log('NEW USER');

			// Generates a TOKEN for the user
			var token = Crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
			var db = firebase.database();
			var ref = db.ref("user");

			/*
			* New User
			* thirdAuth can be any authentication provider(E.i.: Firebase Auth, Facebook)
			*/
			var newUser = ref.push({
			  id_thirdAuth: req.body.id_thirdAuth,
			  token: token,
			  first_login: true
			}, function(error){
				if(error){
					console.log(error);
					res.status(406).send();
				}
				else{
					console.log('deu certo');
					res.status(200).send();
				}
			});
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
 					// var notFound = false;
 					// var count = 0;
 					
 					// Find user in the list
 					for(var idUser in listUser.val()) {

 						// if(notFound) {
 						// 	res.send(200).send(false);
 						// }

 						console.log('aqui1')

 						// Verifica se id do usuario auth do firebase foi encontrado
						if(idUserFireFind === listUser.val()[idUser].id_fireAuth) {
							console.log('aqui2')
							console.log(listUser.val()[idUser].id_fireAuth)

							var ref_user = db.ref("user/" + idUser);

							ref_user.once('value', function(result) {
								// If it is not first login then respond false
								// otherwise update the attr and respond true

								if(result.val().first_login) {
									console.log('enviou aqui 3')
									ref_user.update({ first_login: false });
									res.status(200).send(true);
								}
								else {
									console.log('enviou aqui 4')
									res.status(200).send(false);
								}
							});
						}
					}
				}
				else {
					console.log('enviou aqui 2')
					res.status(200).send(false);
				}

			}, function (errorObject) {
			  console.log("The read failed: " + errorObject.code);
			  console.log('enviou aqui 1')
			  res.status(200).send(false);
			});
		})


module.exports = router;