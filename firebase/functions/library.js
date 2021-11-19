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

