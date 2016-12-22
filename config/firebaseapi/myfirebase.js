var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert("./to/dressme-c8474-firebase-adminsdk-xxwt8-eb8ec14e67.json"),
  databaseURL: "https://dressme-c8474.firebaseio.com"
});

module.exports = firebase;

