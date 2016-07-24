var firebase = require("firebase");

//Firebase
firebase.initializeApp({
  databaseURL: 'https://dressme-84bf9.firebaseio.com',
  serviceAccount: './dressme-6b20265afc37.json'
});

module.exports = firebase;

