#include <Arduino.h>
#include "Nipplio.h"

#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <WiFiManager.h> //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <EEPROM.h>
#include "FirebaseNetwork.h"
#include "Storage.h"
#include <ESPmDNS.h>

// Set these to run example.
#define FIREBASE_HOST "https://nipplio-default-rtdb.europe-west1.firebasedatabase.app/"
WebServer server(80);

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
	getAuthTokensFromCustomToken(customToken);
	getUserData();
	updateBoardInformation();
	server.sendHeader("Access-Control-Allow-Origin", "*");
	server.send(200, "application/json", "\"idToken\":\"" + idToken + "\",\"refreshToken\":\"" + refreshToken + "\"");
}

void setBoardIdRoute()
{
	String bId = server.arg("boardId");
	boardId = bId;
	server.sendHeader("Access-Control-Allow-Origin", "*");
	server.send(200, "application/json", "{'statusCode':'OK'}");
}

void getConfigRoute()
{
	String output = "";
	DynamicJsonDocument doc(4096);
	doc["boardID"] = boardId;
	doc["uid"] = uid;
	doc["idToken"] = idToken;
	doc["refreshToken"] = refreshToken;

	JsonArray slots = doc.createNestedArray("slotNames");
	for (int i = 0; i < (sizeof(slotNames) / sizeof(slotNames[0])); i++)
	{
		if (slotNames[i] != "")
		{
			slots.add(slotNames[i]);
		}
	}
	JsonArray soundsMapping = doc.createNestedArray("slotSoundMapping");
	for (int i = 0; i < (sizeof(slotSoundMapping) / sizeof(slotSoundMapping[0])); i++)
	{
		if (slotSoundMapping[i] != "")
		{
			soundsMapping.add(slotSoundMapping[i]);
		}
	}
	serializeJson(doc, output);

	server.sendHeader("Access-Control-Allow-Origin", "*");
	server.send(200, "application/json", output);
}

void setSlotSoundMappingRoute()
{
	String body = server.arg("plain");

	memset(slotSoundMapping, 0, sizeof(slotSoundMapping));
	StaticJsonDocument<1024> doc;
	deserializeJson(doc, body);

	// extract the values
	JsonArray array = doc.as<JsonArray>();
	int i = 0;
	for (JsonVariant v : array)
	{
		if (i < 255)
		{
			Serial.println(v.as<int>());
			slotSoundMapping[i] = v.as<String>();
			i++;
		}
	}
	server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
	server.sendHeader("Access-Control-Allow-Headers", "*");
	getConfigRoute();
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
	setupFirebaseNetwork();
	for (int i = 0; i < 17; i = i + 8)
	{
		chipId |= ((ESP.getEfuseMac() >> (40 - i)) & 0xff) << i;
	}

	Serial.printf("ESP32 Chip model = %s Rev %d\n", ESP.getChipModel(), ESP.getChipRevision());
	Serial.printf("This chip has %d cores\n", ESP.getChipCores());
	Serial.print("Chip ID: ");
	Serial.println(chipId);
	Serial.print("efuse ID: ");
	Serial.println(ESP.getEfuseMac());
	storageSetup();
	readValuesFromSpiffs();
	WiFiManager wifiManager;
	wifiManager.autoConnect();
	Serial.println(WiFi.localIP());
	String str = String(chipId);
	// Length (with one extra character for the null terminator)
	int str_len = str.length() + 1;

	// Prepare the character array (the buffer)
	char char_array[str_len];

	// Copy it over
	str.toCharArray(char_array, str_len);
	if (!MDNS.begin(char_array))
	{ // Start the mDNS responder for esp8266.local
		Serial.println("Error setting up MDNS responder!");
	}
	MDNS.addService("nipplio", "tcp", 80);
	Serial.println("Added nipplio service tcp on port 80");

	server.on("/", handleRoot);
	server.on("/loginWithCustomToken", loginWithCustomToken);
	server.on("/setBoardId", setBoardIdRoute);
	server.on("/setSlotSoundMapping", setSlotSoundMappingRoute);
	server.on("/getConfig", getConfigRoute);
	server.begin();
	String recivedData;
	recivedData = read_String(10);
	Serial.println("read_String: " + recivedData);
}

void Nipplio::setSlotNames(String slotNamesArray[])
{
	for (int i = 0; i < sizeof(slotNamesArray); i++)
	{
		slotNames[i] = slotNamesArray[i];
	}
}

void Nipplio::triggerSlotWithNumber(int slot)
{
	updatePlaySound(slotSoundMapping[slot]);
}

void Nipplio::loop()
{
	server.handleClient();
	//MDNS.update();
}
