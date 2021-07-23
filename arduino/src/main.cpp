#include <Arduino.h>
#include <Nipplio.h>

Nipplio nipplio;

void setup()
{
  Serial.begin(115200);
  nipplio.setup();
  Serial.println("connected...yeey :)");
}

void loop()
{
  // put your main code here, to run repeatedly:
  nipplio.loop();
}