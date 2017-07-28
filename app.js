var express = require('express');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose')
var occasions = require('./routes/occasions');
var upload = require('./routes/upload'); 
var user = require('./routes/user');
var look = require('./routes/look'); 
var recommendation = require('./routes/recommendation'); 
var app = express();

//connect to our database
//Ideally you will obtain DB details from a config file
/*var dbName = 'movieDB';
var connectionString = 'mongodb://localhost:27017' + dbName;

mongoose.connect(connectionString);*/


//Trying to set headers
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');
  next();
});
 
//configure body-parser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());

app.use('/api', occasions);
app.use('/api', upload);
app.use('/api', user);
app.use('/api', look);
app.use('/api', recommendation);

module.exports = app;