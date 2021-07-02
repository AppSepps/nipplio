const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.createBoard = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const boardName = data.boardName;
  const boardResponse = await admin
    .database()
    .ref("/boards/")
    .push({
      name: boardName,
      owner: uid,
      users: {
        [uid]: true,
      },
    });
  await admin
    .database()
    .ref("/users/" + uid + "/boards")
    .update({
      [boardResponse.key]: true,
    });
});
