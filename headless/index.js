const commandLineArgs = require("command-line-args");
const fs = require("fs");
const player = require("play-sound")((opts = {}));

const firebase = require("firebase");
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

let firstSoundStart = true;
let audio = null;
const optionDefinitions = [
  { name: "boardId", alias: "b", type: String },
  { name: "debug", type: Boolean, defaultOption: false },
  { name: "forceSoundsDownload", type: Boolean },
  { name: "displayName", alias: "d", type: String },
  { name: "ownerIdToken", type: String },
];
const options = commandLineArgs(optionDefinitions);

const storageHost = options.debug
  ? "http://127.0.0.1:9199"
  : "https://firebasestorage.googleapis.com";
const https = options.debug ? require("http") : require("https");
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

function playSoundWithId(soundId) {
  if (firstSoundStart) {
    firstSoundStart = false;
    return;
  }
  if (audio) audio.kill();
  audio = player.play(`sounds/${soundId}`, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

function downloadSoundWithId(soundId) {
  return new Promise((resolve, reject) => {
    let file = fs.createWriteStream(`sounds/${soundId}`);
    const url = `${storageHost}/v0/b/nipplio.appspot.com/o/boards%2F${boardId}%2F${soundId}?alt=media`;
    console.log(url);
    https
      .get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close(); // close() is async, call cb after close completes.
          resolve();
        });
      })
      .on("error", () => {
        reject();
      });
  });
}

function createSoundsFolderIfNotExists() {
  if (!fs.existsSync("sounds")) {
    fs.mkdirSync("sounds");
  }
}

async function start() {
  createSoundsFolderIfNotExists();
  if (fs.existsSync("user.json")) {
    const userData = JSON.parse(fs.readFileSync("user.json"));
    const user = new firebase.User(
      userData,
      userData.stsTokenManager,
      userData
    );
    try {
      await firebase.auth().updateCurrentUser(user);
    } catch (error) {
      console.log(error);
    }
  } else {
    const loginOnHeadlessWithIdToken = firebase
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

  if (options.forceSoundsDownload) {
    const sounds = await firebase
      .database()
      .ref(`sounds/${boardId}`)
      .once("value");
    const array = [];
    sounds.forEach((child) => {
      array.push(child.key);
      return false;
    });
    for (const [index, childKey] of array.entries()) {
      console.log(`Downloaded: ${index + 1}/${array.length}`);
      await downloadSoundWithId(childKey);
    }
  }

  firebase.auth().onIdTokenChanged(function (user) {
    if (user) {
      saveUserInFile();
    }
  });

  const userRef = firebase
    .database()
    .ref(`/boardUsers/${boardId}/${firebase.auth().currentUser.uid}`);
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", function (snap) {
    if (snap.val() === true) {
      userRef.update({
        connected: true,
        displayName: displayName,
        muted: false,
      });
      userRef.onDisconnect().update({
        connected: false,
      });
    }
  });

  firebase
    .database()
    .ref(`/play/${boardId}`)
    .on(
      "value",
      async (snap) => {
        const value = snap.val();
        console.log("play sound changed: ", value);
        console.log("my uid: ", firebase.auth().currentUser.uid);
        if (
          value.mutedUsers &&
          value.mutedUsers.includes(firebase.auth().currentUser.uid)
        ) {
          return;
        }

        if (fs.existsSync(`sounds/${value.soundId}`)) {
          playSoundWithId(value.soundId);
        } else {
          await downloadSoundWithId(value.soundId);
          playSoundWithId(value.soundId);
        }
      },
      (errorObject) => {
        console.log("The read failed: ", errorObject);
      }
    );
}

start();
