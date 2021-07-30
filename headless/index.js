const commandLineArgs = require("command-line-args");
const fs = require("fs");
var player = require("play-sound")((opts = {}));
const Speaker = require("speaker");

// Create the Speaker instance
const speaker = new Speaker({
  channels: 1, // 2 channels
  bitDepth: 16, // 16-bit samples
  sampleRate: 44100, // 44,100 Hz sample rate
});
var firebase = require("firebase");
firebase.initializeApp({
  apiKey: "AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM",
  authDomain: "nipplio.firebaseapp.com",
  databaseURL: "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nipplio",
  storageBucket: "nipplio.appspot.com",
  messagingSenderId: "352715885889",
  appId: "1:352715885889:web:2d41e46b5ed338c687e5c0",
});

const axios = require("axios").default;
axios.defaults.headers.post["Referer"] = "localhost";

const optionDefinitions = [
  { name: "boardId", alias: "b", type: String },
  { name: "debug", type: Boolean, defaultOption: false },
  { name: "displayName", alias: "d", type: String },
  { name: "ownerIdToken", type: String },
];
const options = commandLineArgs(optionDefinitions);

const storageHost = options.debug
  ? "http://127.0.0.1:9199"
  : "https://firebasestorage.googleapis.com";
var https = options.debug ? require("http") : require("https");
if (options.debug) {
  firebase.auth().useEmulator("http://localhost:9099");
  firebase.database().useEmulator("localhost", 9000);
  firebase.functions().useEmulator("localhost", 5001);
}
const boardId = options.boardId;
const ownerIdToken = options.ownerIdToken;
const displayName = options.displayName;

function saveUserInFile() {
  const userJson = JSON.stringify(firebase.auth().currentUser.toJSON());
  fs.writeFileSync("user.json", userJson);
}

async function start() {
  if (fs.existsSync("user.json")) {
    const userData = JSON.parse(fs.readFileSync("user.json"));
    const user = new firebase.User(
      userData,
      userData.stsTokenManager,
      userData
    );
    await firebase.auth().updateCurrentUser(user);
  } else {
    var loginOnHeadlessWithIdToken = firebase
      .functions()
      .httpsCallable("loginOnHeadlessWithIdToken");
    let customToken;
    const response = await loginOnHeadlessWithIdToken({
      boardId,
      ownerIdToken,
      displayName,
    });
    customToken = response.data.token;
    console.log("custom auth token", customToken);

    try {
      await firebase.auth().signInWithCustomToken(customToken);
      saveUserInFile();
    } catch (error) {
      console.log(error);
    }
  }

  firebase.auth().onIdTokenChanged(function (user) {
    if (user) {
      saveUserInFile();
    }
  });

  var userRef = firebase
    .database()
    .ref(`/boardUsers/${boardId}/${firebase.auth().currentUser.uid}`);
  await userRef.update({
    connected: true,
    displayName: displayName,
    muted: false,
  });
  userRef.onDisconnect().update({
    connected: false,
  });
  firebase
    .database()
    .ref(`/play/${boardId}`)
    .on(
      "value",
      (snap) => {
        const value = snap.val();
        console.log("play sound changed: ", value);
        console.log("my uid: ", firebase.auth().currentUser.uid);
        if (
          value.mutedUsers &&
          value.mutedUsers.includes(firebase.auth().currentUser.uid)
        ) {
          return;
        }

        let file = fs.createWriteStream("file.mp3");
        const url = `${storageHost}/v0/b/nipplio.appspot.com/o/boards%2F${boardId}%2F${value.soundId}?alt=media`;
        console.log(url);
        https.get(url, function (response) {
          response.pipe(file);
          player.play("file.mp3", function (err) {
            if (err) {
              console.log(err);
            }
          });
        });
      },
      (errorObject) => {
        console.log("The read failed: ", errorObject);
      }
    );
}

start();