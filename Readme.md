# Firebase Database structure

```
{
  "users": {
    "userid1": {
      "displayName": "Max Mustermann",
      "boards": {
        "boardid1": true
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
        "muted": false
      }
    }
  },
  "play": {
    "boardid1": {
      "timestamp": 1234,
      "soundName": "",
      "playedBy": "userid1",
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
