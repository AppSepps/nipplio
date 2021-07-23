#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

String uid;
String idToken;
String refreshToken;

void loginWithCustomToken(String customToken)
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
	DynamicJsonDocument doc(1024);
	deserializeJson(doc, payload);
	JsonObject obj = doc.as<JsonObject>();

	String idT = obj["idToken"];
	String refT = obj["refreshToken"];
	String expiresIn = obj["expiresIn"];

	idToken = idT;
	refreshToken = refT;
}