const commandLineArgs = require("command-line-args");
const fs = require("fs");
var https = require("http");
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

firebase.auth().useEmulator("http://localhost:9099");
firebase.database().useEmulator("localhost", 9000);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

const axios = require("axios").default;
axios.defaults.headers.post["Referer"] = "localhost";

const optionDefinitions = [
  { name: "boardId", alias: "b", type: String },
  { name: "displayName", alias: "d", type: String },
  { name: "ownerIdToken", type: String },
];
const options = commandLineArgs(optionDefinitions);

const boardId = options.boardId;
const ownerIdToken = options.ownerIdToken;
const displayName = options.displayName;

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
    const response = await axios.post(
      "http://localhost:5001/nipplio/us-central1/loginOnHeadlessWithIdToken",
      {
        boardId,
        ownerIdToken,
        displayName,
      }
    );
    const customToken = response.data.token;
    console.log("custom auth token", customToken);
    const userCredential = await firebase
      .auth()
      .signInWithCustomToken(customToken);
    var user = userCredential.user;
    console.log(user.uid);
    const userJson = JSON.stringify(firebase.auth().currentUser.toJSON());
    fs.writeFileSync("user.json", userJson);
  }

  try {
    await firebase
      .database()
      .ref(`/boardUsers/${boardId}/${firebase.auth().currentUser.uid}`)
      .update({
        connected: true,
        displayName: displayName,
        muted: false,
      });
    firebase
      .database()
      .ref(`/play/${boardId}`)
      .on(
        "value",
        (snap) => {
          console.log("play sound changed: ", snap.val());
          var file = fs.createWriteStream("file.mp3");
          const url = `http://127.0.0.1:9199/v0/b/nipplio.appspot.com/o/boards%2F${boardId}%2F${
            snap.val().soundId
          }?alt=media`;
          console.log(url);
          var request = https.get(url, function (response) {
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
  } catch (error) {
    console.log(error);
  }
}

start();
