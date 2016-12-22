var firebase = require("firebase-admin");

firebase.initializeApp({
  credential: firebase.credential.cert("./config/firebaseapi/dressme-c8474-firebase-adminsdk-xxwt8-eb8ec14e67.json"),
  databaseURL: "https://dressme-c8474.firebaseio.com"
});

module.exports = firebase;