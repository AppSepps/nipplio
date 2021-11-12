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

exports.copySoundFromLibrary = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const librarySoundId = data.librarySoundId;
    const boardSoundId = data.boardSoundId;
    const boardId = data.boardId;

    // check if user is member of boardId
    const userIsInBoard = await admin.database().ref(`boards/${boardId}/users/${uid}`).once('value')
    if (!userIsInBoard) {
        // user is not in Board -> abort
        return
    }
    await admin.storage().bucket().file(`library/${librarySoundId}`).copy(admin.storage().bucket().file(`boards/${boardId}/${boardSoundId}`))
})