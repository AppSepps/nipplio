const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.addUserByInvite = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const boardId = data.boardId;
  const boardInviteToken = data.token;

  const inviteTokenRef = admin
    .database()
    .ref("/boardInvites/" + boardId + "/" + boardInviteToken);

  let inviteCodeForBoard = await inviteTokenRef.once("value");
  if (inviteCodeForBoard.val() != null) {
    console.log("invite code valid");
    // Add user to board
    await admin
      .database()
      .ref("/boards/" + boardId + "/users")
      .update({
        [uid]: true,
      });
    await admin
      .database()
      .ref("/users/" + uid + "/boards")
      .update({
        [boardId]: true,
      });
    // Remove invite code
    await inviteTokenRef.set(null);
  } else {
    console.log("invite code not valid");
  }
});
