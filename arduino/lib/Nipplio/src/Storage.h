#include <Arduino.h>

extern String uid;
extern String displayName;
extern String idToken;
extern String refreshToken;
extern String boardId;
extern String slotNames[255];
extern String slotSoundMapping[255];

void storageSetup();
void saveValuesToSpiffs();
void readValuesFromSpiffs();