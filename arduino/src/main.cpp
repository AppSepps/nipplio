#include <Arduino.h>
#include <Nipplio.h>

Nipplio nipplio;

void setup()
{
  Serial.begin(115200);
  nipplio.setup();
  String slotNames[] = {"A", "Button2", "Button3", "Button4"};
  nipplio.setSlotNames(slotNames);
  Serial.println("connected...yeey :)");
}

void loop()
{
  // put your main code here, to run repeatedly:
  nipplio.loop();
}