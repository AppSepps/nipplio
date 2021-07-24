#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include "FirebaseNetwork.h"
#include "Storage.h"

void updateBoardInformation()
{
	String host = "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app/users/" + uid + "/remoteDevices/" + ESP.getChipId() + ".json?auth=" + idToken;
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	// TODO: dynamic slot mappings
	const int httpCode = http.PATCH("{\"slots\":{ \"1\": {\"name\": \"Button oben\"},\"2\": {\"name\": \"Button unten\"}}}");
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	http.end();
}

void getUserData()
{
	String host = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	const int httpCode = http.POST("{\"idToken\":\"" + idToken + "\"}");
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
	Serial.println(uid);
	Serial.println(displayName);
}

void getAuthTokensFromCustomToken(String customToken)
{
	String host = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
	HTTPClient http; //Declare object of class HTTPClient
	WiFiClientSecure client;
	client.setInsecure();

	http.begin(client, host); //Specify request destination
	http.addHeader("Content-Type", "application/json");
	http.addHeader("Referer", "https://nipplio.web.app");
	const int httpCode = http.POST("{\"returnSecureToken\":true,\"token\":\"" + customToken + "\"}");
	String payload = http.getString(); //Get the response payload

	Serial.println(httpCode); //Print HTTP return code
	Serial.println(payload);  //Print request response payload

	http.end(); //Close connection
	DynamicJsonDocument doc(2048);
	deserializeJson(doc, payload);

	String idT = doc["idToken"];
	String refT = doc["refreshToken"];
	String expiresIn = doc["expiresIn"];

	idToken = idT;
	refreshToken = refT;
	Serial.println(idToken);
	Serial.println(refreshToken);
}

void refreshIdToken()
{
	String host = "https://securetoken.googleapis.com/v1/token?key=AIzaSyArf5iDUeHvR4CzyNuO-73nESEsXuUQAFM";
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

	http.end(); //Close connection
	DynamicJsonDocument doc(1024);
	deserializeJson(doc, payload);
	JsonObject obj = doc.as<JsonObject>();

	String idT = obj["idToken"];
	String refT = obj["refreshToken"];
	String expiresIn = obj["expiresIn"];

	idToken = idT;
	refreshToken = refT;
}