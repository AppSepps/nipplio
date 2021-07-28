#include "Storage.h"
#include "SPIFFS.h"
#include <ArduinoJson.h>

String uid = "";
String displayName = "";
String idToken = "";
String refreshToken = "";
String boardId = "";
String slotNames[255];
String slotSoundMapping[255];

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
	String output = "";
	File file = SPIFFS.open("/config.json", FILE_WRITE);
	DynamicJsonDocument doc(2048);

	doc["uid"] = uid;
	doc["displayName"] = displayName;
	doc["idToken"] = idToken;
	doc["refreshToken"] = refreshToken;
	doc["boardId"] = boardId;

	JsonArray mapping = doc.createNestedArray("slotSoundMapping");
	for (int i = 0; i < (sizeof(slotSoundMapping) / sizeof(slotSoundMapping[0])); i++)
	{
		if (slotSoundMapping[i] != "")
		{
			mapping.add(slotSoundMapping[i]);
		}
	}

	serializeJson(doc, output);
	file.print(output);
	file.close();
}

void readValuesFromSpiffs()
{
	File file = SPIFFS.open("/config.json", FILE_WRITE);
	String input = file.readString();

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
	const char *boardId_ = doc["boardId"];
	JsonArray slotSoundMapping_ = doc["slotSoundMapping"];

	int i = 0;
	for (JsonVariant v : slotSoundMapping_)
	{
		if (i < 255)
		{
			Serial.println(v.as<int>());
			slotSoundMapping[i] = v.as<String>();
			i++;
		}
	}

	uid = uid_;
	displayName = displayName_;
	idToken = idToken_;
	refreshToken = refreshToken_;
	boardId = boardId_;
}