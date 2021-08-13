#include <Arduino.h>
#include <Nipplio.h>

Nipplio nipplio;

const int* currentUser = {4, 22, 16, 25, 17, 27};

const int button1 = currentUser[0];
const int button2 = currentUser[1];
const int button3 = currentUser[2];
const int button4 = currentUser[3];
const int button5 = currentUser[4];
const int button6 = currentUser[5];

int buttonState1 = 1;
int buttonState2 = 1;
int buttonState3 = 1;
int buttonState4 = 1;
int buttonState5 = 1;
int buttonState6 = 1;

void setup()
{
  Serial.begin(115200);
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  pinMode(button3, INPUT_PULLUP);
  pinMode(button4, INPUT_PULLUP);
  pinMode(button5, INPUT_PULLUP);
  pinMode(button6, INPUT_PULLUP);

  nipplio.setup();
  String slotNames[] = {"1", "2", "3", "4", "5", "6"};
  nipplio.setSlotNames(slotNames, 6);
  //Serial.println("connected...yeey :)");
}


void setButtonDown(int button)
{
  nipplio.triggerSlotWithNumber(button);
}

void setButtonUp(int button)
{
  //setButton(false, button);
}


void checkButton(int buttonNumner, int &oldState, int newState, boolean reversed)
{
  if (oldState != newState)
  {
    if (newState == LOW)
    {
      // Button pressed
      if (!reversed)
      {
        setButtonDown(buttonNumner);
      }
      else
      {
        setButtonUp(buttonNumner);
      }
    }
    else
    {
      // Button released
      if (!reversed)
      {
        setButtonUp(buttonNumner);
      }
      else
      {
        setButtonDown(buttonNumner);
      }
    }
    oldState = newState;
  }
}

void loop()
{
  // put your main code here, to run repeatedly:
  nipplio.loop();

  int newButton1State = digitalRead(button1);
  int newButton2State = digitalRead(button2);
  int newButton3State = digitalRead(button3);
  int newButton4State = digitalRead(button4);
  int newButton5State = digitalRead(button5);
  int newButton6State = digitalRead(button6);

  checkButton(0, buttonState1, newButton1State, false);
  checkButton(1, buttonState2, newButton2State, false);
  checkButton(2, buttonState3, newButton3State, false);
  checkButton(3, buttonState4, newButton4State, false);
  checkButton(4, buttonState5, newButton5State, false);
  checkButton(5, buttonState6, newButton6State, false);

  delay(50);
}