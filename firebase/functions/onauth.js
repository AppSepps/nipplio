const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.createUserInDatabase = functions.auth.user().onCreate(async (user) => {
  await admin.database.ref("/users/" + user.uid + "/").push({
    displayName: user.displayName,
  });
});
