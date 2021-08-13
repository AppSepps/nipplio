const functions = require("firebase-functions");
const admin = require("firebase-admin");
const invite = require("./invite");

async function addUserToUsersDB(uid, displayName) {
  await admin
    .database()
    .ref("/users/" + uid + "/")
    .update({
      displayName: displayName,
    });
}

exports.createUserInDatabase = functions.auth.user().onCreate(async (user) => {
  await addUserToUsersDB(user.uid, user.displayName);
});

exports.createAuthToken = functions.https.onCall(async (data, request) => {
  const oneTimeCode = data["ot-auth-code"];
  const idToken = data["id-token"];

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const uid = decodedToken.uid;

  const authToken = await admin.auth().createCustomToken(uid);

  console.log("Authentication token", authToken);

  await admin.database().ref(`ot-auth-codes/${oneTimeCode}`).set(authToken);

  return {
    token: authToken,
  };
});

exports.createAndReturnAuthToken = functions.https.onCall(
  async (data, request) => {
    const idToken = data["id-token"];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const uid = decodedToken.uid;

    const authToken = await admin.auth().createCustomToken(uid);

    console.log("Authentication token", authToken);

    return {
      token: authToken,
    };
  }
);

exports.getUserIdForIdToken = functions.https.onRequest(async (req, res) => {
  const idToken = req.params["id-token"];

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const uid = decodedToken.uid;

  res.send(uid);
});

exports.loginOnHeadlessWithIdToken = functions.https.onCall(
  async (data, request) => {
    const boardId = data["boardId"];
    const ownerIdToken = data["ownerIdToken"];
    const displayName = data["displayName"];
    if (boardId == null || ownerIdToken == null || displayName == null) {
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(ownerIdToken);

    const uid = decodedToken.uid;
    // Check if user who called (ownerIdToken) is the real owner of the board
    const boardOwnerSnap = await admin
      .database()
      .ref(`/boards/${boardId}/owner`)
      .once("value");
    const boardOwnerId = boardOwnerSnap.val();
    if (boardOwnerId !== uid) {
      return;
    }

    const newUseruid =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const authToken = await admin.auth().createCustomToken(newUseruid);
    addUserToUsersDB(newUseruid, displayName);
    invite.addUserToBoardInDB(newUseruid, boardId);
    console.log("Authentication token", authToken);

    return {
      token: authToken,
    };
  }
);
