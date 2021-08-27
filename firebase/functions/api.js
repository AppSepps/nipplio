const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.playApiSound = functions.https.onRequest(async (request, response) => {
  const boardId = request.body.boardId;
  const apiKey = request.body.apiKey;
  const soundId = request.body.soundId;
  const mutedUsers = request.body.mutedUsers || null;
  const boardResponse = await admin
    .database()
    .ref(`/apiKeys/${boardId}/${apiKey}`)
    .once("value");

  if (boardResponse.val()) {
    await admin.database().ref(`/play/${boardId}/`).update({
      playedBy: apiKey,
      random: false,
      soundId,
      mutedUsers,
      source: "api",
      uuid: Date.now(),
    });
    response.send(200);
  } else {
    response.send(401);
  }
});
