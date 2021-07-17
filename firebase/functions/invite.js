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
    // Check if user is already member of board
    const user = await admin
      .database()
      .ref("/boards/" + boardId + "/users/" + uid)
      .once("value");
    if (user.exists()) {
      throw new Error("user-exists", "user already member of board");
    }

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
    return {
      message: "added user successfully to board",
    };
  } else {
    console.log("invite code not valid");
    throw new functions.https.HttpsError(
      "invalid-code",
      "The invite code is not valid"
    );
  }
});
