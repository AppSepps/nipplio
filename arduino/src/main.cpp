#include <Arduino.h>
#include <Nipplio.h>

Nipplio nipplio;

int buttonState = 1; // current state of the button
int lastButtonState = 1;

int buttonState2 = 1; // current state of the button
int lastButtonState2 = 1;

void setup()
{
  Serial.begin(115200);
  pinMode(D1, INPUT_PULLUP);
  pinMode(D2, INPUT_PULLUP);

  nipplio.setup();
  String slotNames[] = {"A", "Button2", "Button3", "Button4"};
  nipplio.setSlotNames(slotNames);
  Serial.println("connected...yeey :)");
}

void loop()
{
  // put your main code here, to run repeatedly:
  nipplio.loop();
  buttonState = digitalRead(D1);

  // compare the buttonState to its previous state
  if (buttonState != lastButtonState)
  {
    if (buttonState == LOW)
    {
      Serial.println("trigger Slot 0");
      nipplio.triggerSlotWithNumber(0);
    }
  }
  lastButtonState = buttonState;

  buttonState2 = digitalRead(D2);

  // compare the buttonState to its previous state
  if (buttonState2 != lastButtonState2)
  {
    if (buttonState2 == LOW)
    {
      Serial.println("trigger Slot 1");
      nipplio.triggerSlotWithNumber(1);
    }
  }
  lastButtonState2 = buttonState2;
}