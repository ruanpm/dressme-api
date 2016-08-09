//var Movie = require('../models/movie');
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')

var router = express.Router();

//TEST - used to allow access from diferent IP locations
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

	//ROUTE
	router.route('/occasions')
		//CREATE NEW OCCASION
		.post(function(req, res) {

			console.log('Start: NEW OCCASION CREATION');

			var db = firebase.database();
			var ref = db.ref("occasions");
 
			console.log(req.body);

			//New Occasion
			var newOccasion = ref.push({
			  name: req.body.name,
			  desc: req.body.desc,
			  mood: req.body.mood,
			  location: req.body.location,
			  date: req.body.date,
			  time: req.body.time,
			  url: req.body.url,
			  picture: req.body.picture,
			  //looks: req.body.looks
			}, function(error){
				if(error){
					console.log(error);
					 res.status(500).send('Internal Server Error')
				}
				else{
					//This is the just created occasion id
					var idNewOccasion = newOccasion.key;
					console.log("NEW OCCASION ID: " + idNewOccasion);

					//If could create the Occasion 
					//add new Looks inside it
					var looks = req.body.looks;
					looks.forEach(function(look) {
						//console.log(look);
						var newLook = newOccasion.child("looks").push({
							picture: look.picture,
						  	like: look.like,
						  	dislike: look.dislike,
						  	desc: look.desc
						}, function(error){
							if(error){
								console.log(error);
								 res.status(500).send('Internal Server Error')
							}
						});
					});

					res.json({"id": idNewOccasion, "msg": "OK"});
				}
			});
		})

		//GET ALL OCCASIONS
		.get(function(req, res) {

			console.log('Start: GET ALL OCCASIONS');

			// Get a database reference to our posts
			var db = firebase.database();
			var ref = db.ref('occasions');

			// Attach an asynchronous callback to read the data at our posts reference
			ref.on('value', function(snapshot) {
			  //console.log(snapshot.val());
			  res.json(snapshot.val());
			}, function (errorObject) {
			  console.log('The read failed: ' + errorObject.code);
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
			  picture: req.body.picture,
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

			console.log('Start: DELETE SPECIFIC OCCASION');

			//Get a database reference to the occasion
			var db = firebase.database();
			var ref = db.ref("occasions/" + req.params.id);

			var onComplete = function(error) {
			  if (error) {
			    res.status(204);
			  } else {
			    res.status(200);
			  }
			};

			ref.remove(onComplete)
		});

module.exports = router;