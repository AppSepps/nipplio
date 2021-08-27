# API Requests

The Nipplio application has the ability to play sounds through an api.

#### URL

`https://us-central1-nipplio.cloudfunctions.net/playApiSound`

#### Request (POST)

```
{
    "boardId": "BOARD_ID",
    "apiKey": "API_KEY",
    "soundId": "SOUND_ID"
}
```

# Firebase Database structure

```
{
  "users": {
    "userid1": {
      "displayName": "Max Mustermann",
      "remoteDevices": {
        "deviceId1": { // Unique Hardware-ID
          "slots": { // Set through Hardware
            "0": "Button 1",
            "1": "Button 2",
            "2": "Button 3"
          },
          "boardID": { // Set through UI
            "slots" : {
              "0": "soundid1",
              "1": "soundid2",
              "2": "soundid3",
            }
          }
        }
      },
      "boards": {
        "boardid1": true
      }
    }
  },
  "remotePlay": {
    "userid": {
      "remoteDeviceId": {
        "uuid": "asdf", // To get notified when the same slot is played twice
        "slotId": 2
      }
    }
  },
  "sounds": {
    "boardid1": {
      "soundid1": {
        "name": "Dry fart",
        "duration": 12345,
        "createdAt": "date",
        "uploadedBy": "userid1"
      },
      "soundid2": {
        "name": "Dry fart",
        "duration": 12345,
        "createdAt": "date",
        "uploadedBy": "userid1"
      }
    }
  },
  "boardUsers": {
    "boardid1": {
      "userid1": {
        "displayName": "Max Mustermann",
        "connected": false,
        "muted": false,
        "activeSessionId": "12346ajsdf"
      }
    }
  },
  "play": {
    "boardid1": {
      "timestamp": 1234,
      "soundName": "",
      "playedBy": "userid1",
      "random": false,
      "source": "desktop", // desktop, web, api, hardware
      "mutedUsers": {
        "userid2": true,
        "userid3": true
      }
    }
  },
  "boardInvites": {
    "boardid1": {
      "asdkfjaksdfjalskdjfaskdfj": true //https://nipplio.web.app/invite?boardId=boardid1&token=asdf
    }
  },
  "boards": {
    "boardid1": {
      "name": "Name",
      "owner": "userid1",
      "users": {
        "userid1": true
      }
    }
  }
}

```
