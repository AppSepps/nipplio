#include "Storage.h"
#include "SPIFFS.h"
#include <ArduinoJson.h>

String uid;
String displayName;
String idToken;
String refreshToken;
String slotNames[255];

void storageSetup()
{
	if (!SPIFFS.begin(true))
	{
		Serial.println("An Error has occurred while mounting SPIFFS");
		return;
	}
}

void saveValuesToSpiffs()
{
	String output;
	File file = SPIFFS.open("/config.json", FILE_WRITE);
	if (!file)
	{
		Serial.println("There was an error opening the file for writing");
		return;
	}
	DynamicJsonDocument doc(2048);

	doc["uid"] = uid;
	doc["displayName"] = displayName;
	doc["idToken"] = idToken;
	doc["refreshToken"] = refreshToken;

	serializeJson(doc, output);
	if (file.print(output))
	{
		Serial.println("File was written");
	}
	else
	{
		Serial.println("File write failed");
	}

	file.close();
}

void readValuesFromSpiffs()
{
	File file = SPIFFS.open("/config.json");
	if (!file)
	{
		Serial.println("There was an error opening the file for writing");
		return;
	}
	Serial.print("input from config.json: ");
	String input = file.readString();
	Serial.println(input);

	DynamicJsonDocument doc(2048);

	DeserializationError error = deserializeJson(doc, input);

	if (error)
	{
		Serial.print(F("deserializeJson() failed: "));
		Serial.println(error.f_str());
		return;
	}

	const char *uid_ = doc["uid"];
	const char *displayName_ = doc["displayName"];
	const char *idToken_ = doc["idToken"];
	const char *refreshToken_ = doc["refreshToken"];
	
	uid = uid_;
	displayName = displayName_;
	idToken = idToken_;
	refreshToken = refreshToken_;
}