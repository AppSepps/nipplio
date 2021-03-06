const onauth = require("./onauth");
const board = require("./board");
const invite = require("./invite");
const api = require("./api");
const library = require("./library")
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.onUserCreated = onauth.createUserInDatabase;
exports.createAuthToken = onauth.createAuthToken;
exports.loginOnHeadlessWithIdToken = onauth.loginOnHeadlessWithIdToken;
exports.createAndReturnAuthToken = onauth.createAndReturnAuthToken;
exports.createBoard = board.createBoard;
exports.addUserByInvite = invite.addUserByInvite;
exports.getUserIdForIdToken = onauth.getUserIdForIdToken;
exports.playApiSound = api.playApiSound;
exports.soundChangedListener = library.soundChangedListener
