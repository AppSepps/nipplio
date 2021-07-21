const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.createUserInDatabase = functions.auth.user().onCreate(async (user) => {
  await admin
    .database()
    .ref("/users/" + user.uid + "/")
    .update({
      displayName: user.displayName,
    });
});

exports.createAuthToken = functions.https.onCall(async (data, request) => {
  const oneTimeCode = data["ot-auth-code"]
  const idToken = data["id-token"]

  const decodedToken = await admin.auth().verifyIdToken(idToken)

  const uid = decodedToken.uid

  const authToken = await admin.auth().createCustomToken(uid)

  console.log("Authentication token", authToken)

  await admin.database().ref(`ot-auth-codes/${oneTimeCode}`).set(authToken)

  return {
    token: authToken
  }
})