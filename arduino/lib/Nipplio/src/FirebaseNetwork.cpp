#include <Arduino.h>
//#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "FirebaseNetwork.h"
#include "Storage.h"
//#include <ESP8266TrueRandom.h>
#include <ArduinoJson.h>
#include "uuid.h"

unsigned long lastRefreshTokenUpdateTimeInMillis = 0;
uint32_t chipId;

void setupFirebaseNetwork()
{
	for (int i = 0; i < 17; i = i + 8)
	{
		chipId |= ((ESP.getEfuseMac() >> (40 - i)) & 0xff) << i;
	}
}

void refreshIdToken();

void checkIfRefreshTokenStillValidAndIfNotRefreshTheToken()
{
	if (millis() > lastRefreshTokenUpdateTimeInMillis + 3600000 || lastRefreshTokenUpdateTimeInMillis == 0 || millis() < lastRefreshTokenUpdateTimeInMillis)
	{
		// RefreshTokenExpired
		refreshIdToken();
	}
}

void updateBoardInformation()
{
	checkIfRefreshTokenStillValidAndIfNotRefreshTheToken();
	String host = "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app/users/" + uid + "/remoteDevices/" + chipId + "/slots.json?auth=" + idToken;
	Serial.println(host);
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	// TODO: dynamic slot mappings
	String jsonOutput;
	DynamicJsonDocument doc(2048);

	for (int i = 0; i < (sizeof(slotNames) / sizeof(slotNames[0])); i++)
	{
		if (slotNames[i] != "")
		{
			doc[String(i)] = slotNames[i];
		}
	}
	serializeJson(doc, jsonOutput);
	const int httpCode = http.POST(jsonOutput);
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	http.end();
}

void updatePlaySound(int slotId)
{
	checkIfRefreshTokenStillValidAndIfNotRefreshTheToken();
	String host = "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app/remotePlay/" + uid + "/" + chipId +".json?auth=" + idToken;
	Serial.println(host);
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	// TODO: dynamic slot mappings

	String uuidStr = StringUUIDGen();
	Serial.println("The UUID number is " + uuidStr);

	const int httpCode = http.PATCH("{\"slotId\":\"" + String(slotId) + "\", \"uuid\":\"" + uuidStr + "\"}");
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	http.end();
}
void getUserData()
{
	checkIfRefreshTokenStillValidAndIfNotRefreshTheToken();
	String host = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
	Serial.println(host);
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	String request = "{\"idToken\":\"" + idToken + "\"}";
	Serial.println("request: " + request);
	const int httpCode = http.POST(request);
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	http.end();
	DynamicJsonDocument doc(2048);
	deserializeJson(doc, payload);

	JsonObject users_0 = doc["users"][0];
	String users_0_localId = users_0["localId"];
	String users_0_email = users_0["email"];
	uid = users_0_localId;
	displayName = users_0_email;

	saveValuesToSpiffs();
}
void getAuthTokensFromCustomToken(String customToken)
{
	String host = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
	Serial.println(host);
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	const int httpCode = http.POST("{\"returnSecureToken\":true,\"token\":\"" + customToken + "\"}");
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode);	 //Print HTTP return code
	Serial.println(payload);	 //Print request response payload
	Serial.println(sizeof(payload)); //Print request response payload

	DynamicJsonDocument doc(2048);
	DeserializationError error = deserializeJson(doc, payload);
	if (error)
	{
		Serial.print(F("deserializeJson() failed: "));
		Serial.println(error.f_str());
		client.stop();
		return;
	}
	Serial.println("capacity: " + doc.capacity());

	String idT = doc["idToken"];
	String refT = doc["refreshToken"];
	String expiresIn = doc["expiresIn"];

	idToken = idT;
	refreshToken = refT;
	Serial.println(idToken);
	Serial.println(refreshToken);

	lastRefreshTokenUpdateTimeInMillis = millis();
	saveValuesToSpiffs();
	http.end(); //Close connection
}

void refreshIdToken()
{
	String host = "https://securetoken.googleapis.com/v1/token?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
	Serial.println(host);
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	const int httpCode = http.POST("{\"grant_type\":\"refresh_token\",\"refresh_token\":\"" + refreshToken + "\"}");
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	DynamicJsonDocument doc(3072);
	DeserializationError error = deserializeJson(doc, payload);
	if (error)
	{
		Serial.print(F("deserializeJson() failed: "));
		Serial.println(error.f_str());
		client.stop();
		return;
	}
	Serial.println("capacity: " + doc.capacity());

	String idT = doc["id_token"];
	String refT = doc["refresh_token"];
	String expiresIn = doc["expires_in"];

	idToken = idT;
	refreshToken = refT;
	Serial.println(idToken);
	Serial.println(refreshToken);

	lastRefreshTokenUpdateTimeInMillis = millis();
	saveValuesToSpiffs();
	http.end(); //Close connection
}