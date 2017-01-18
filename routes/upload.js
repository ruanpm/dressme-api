
var express = require('express');
var firebase = require('../config/firebaseapi/myfirebase')

var AWS = require('aws-sdk');
var HttpUtil = require('../utils/httpUtil.js');
var CWebp = require('cwebp').CWebp;
var gm = require('gm');

AWS.config.update({
    accessKeyId: "AKIAIBMVMAYJZTAMRPAA",
    secretAccessKey: "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",
    region: "us-east-1"
});


var router = express.Router();
var rootPath = '/upload';

	//ROUTE
	router.route(rootPath + '/look')
		//UPLOAD LOOK TO AMAZON S3 STORAGE
		.post(function(req, res) {
			
		    var file = req.body.file;

		    if(file != null){

		      var s3 = new AWS.S3();	
			  var imageName = req.body.name;
			  var bucket = "dressmeapp";
		      
		      console.log("chamou o upload service bucket " + bucket);  
		      
		      var buffer = new Buffer(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');


		  		var data = {
				    Key: imageName, 
				    Body: buffer,
				    ContentEncoding: 'base64',
				    ContentType: 'image/jpeg',
				    Bucket: 'dressmeapp'
				  };
				  s3.putObject(data, function(err, data){
				      if (err) { 
				        console.log(err);
				        console.log('Error uploading data: ', data); 
				      } else {
				        console.log('succesfully uploaded the image!');
				      }
				  });


		        res.status(HttpUtil.CREATED).end();
		    } else {
		      res.status(HttpUtil.NOT_FOUND).end();
		    }
			
		});
		

module.exports = router;