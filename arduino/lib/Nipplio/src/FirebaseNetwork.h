#include <Arduino.h>

extern uint32_t chipId;

void setupFirebaseNetwork();
void getAuthTokensFromCustomToken(String customToken);
void getUserData();
void updateBoardInformation();
void updatePlaySound(int slotId);
void checkIfRefreshTokenStillValidAndIfNotRefreshTheToken();