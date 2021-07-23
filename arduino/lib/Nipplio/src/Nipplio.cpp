#include <Arduino.h>
#include "Nipplio.h"

#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h> //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <EEPROM.h>

// Set these to run example.
#define FIREBASE_HOST "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app/"
ESP8266WebServer server(80);

String refreshToken;
String idToken;

Nipplio::Nipplio()
{
}

void writeString(char add, String data);
String read_String(char add);

void handleRoot()
{
	server.send(200, "text/plain", "hello from esp8266!\r\n");
}

void loginWithCustomToken()
{
	String customToken = server.arg("customToken");
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

	writeString(10, idToken);
	server.send(200, "text/plain", payload);
}

void refreshIdToken()
{
	String refreshToken = "";
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
	writeString(10, payload);
	server.send(200, "text/plain", payload);
}

void writeString(char add, String data)
{
	int _size = data.length();
	int i;
	for (i = 0; i < _size; i++)
	{
		EEPROM.write(add + i, data[i]);
	}
	EEPROM.write(add + _size, '\0'); //Add termination null character for String Data
	EEPROM.commit();
}

String read_String(char add)
{
	int i;
	char data[100]; //Max 100 Bytes
	int len = 0;
	unsigned char k;
	k = EEPROM.read(add);
	while (k != '\0' && len < 500) //Read until null character
	{
		k = EEPROM.read(add + len);
		data[len] = k;
		len++;
	}
	data[len] = '\0';
	return String(data);
}

void Nipplio::setup()
{
	WiFiManager wifiManager;
	wifiManager.autoConnect();
	Serial.println(WiFi.localIP());
	if (!MDNS.begin("esp8266"))
	{ // Start the mDNS responder for esp8266.local
		Serial.println("Error setting up MDNS responder!");
	}
	MDNS.addService("nipplio", "tcp", 80);
	Serial.println("Added nipplio service tcp on port 80");

	server.on("/", handleRoot);
	server.on("/loginWithCustomToken", loginWithCustomToken);
	server.begin();
	String recivedData;
	recivedData = read_String(10);
	Serial.println("read_String: " + recivedData);
}

void Nipplio::setBoardSlots(int numberOfAvailableSlots) 
{
}

void Nipplio::loop()
{
	server.handleClient();
	MDNS.update();
}
