const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.soundChangedListener = functions.firestore
    .document('sounds/{soundId}')
    .onUpdate(async (change, context) => {
        if (change.before.data().playlists !== undefined && change.after.data().playlists.length === 0) {
            await admin.storage().bucket().file(`library/${context.params.soundId}`).delete()
            await admin.firestore().collection('sounds').doc(context.params.soundId).delete()
        }
    });


exports.copySoundFromBoardToLibrary = functions.https.onCall(async (data, context) => {
    console.log(data)
    const uid = context.auth.uid;
    const boardSoundId = data.boardSoundId;
    const boardId = data.boardId;
    const playlistId = data.playlistId;
    const librarySoundId = data.librarySoundId;

    // check if user is owner of playlist
    const playlistDoc = await admin.firestore().collection('playlists').doc(playlistId).get()
    if (playlistDoc.data().owner !== uid) {
        // user is not in Board -> abort
        console.log("Error: User not the owner of the playlist")
        return
    } else {
        console.log("Error: User is a member of the board")
    }

    await admin.storage().bucket().file(`boards/${boardId}/${boardSoundId}`).copy(admin.storage().bucket().file(`library/${librarySoundId}`))
    return {
        message: "copied sound from library to board",
    };
})