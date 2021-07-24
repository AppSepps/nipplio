#ifndef Nipplio_h
#define Nipplio_h

#include "Arduino.h"

class Nipplio
{
public:
	Nipplio();
	void setup();
	void setSlotNames(String slotNames[]);
	void triggerSlotWithNumber(int slot);
	void loop();
};
#endif