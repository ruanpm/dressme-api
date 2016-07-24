//var Movie = require('../models/movie');
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')


var router = express.Router();

	router.route('/occasions')
		.post(function(req, res) {

			console.log('NEW OCCASION');

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
					res.status(406);
				}
				else{
					res.status(200);
				}
			});

			//Add new Looks inside Occasion
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
						res.status(406);
					}
					else{
						res.status(200);
					}
				});
			});
		});

	router.route('/occasions/:id')
		.get(function(req, res) {

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

		.put(function(req,res){
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
				if(error)
					console.log(error);
				res.status(200);
			});
		})

		.delete(function(req, res) {
			// Get a database reference to the occasion
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