#ifndef Nipplio_h
#define Nipplio_h

#include "Arduino.h"

class Nipplio
{
public:
	Nipplio();
	void setup();
	void setBoardSlots(int numberOfAvailableSlots);
	void triggerSlotWithNumber(int slot);
	void loop();
};
#endif