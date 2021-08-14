#include <Arduino.h>
#include <Nipplio.h>

Nipplio nipplio;

const int NUMBER_BUTTONS = 6;
const int NUMBER_MODES = 3;

const int currentUser[NUMBER_BUTTONS] = {4, 32, 16, 25, 17, 27};

const int button1 = currentUser[0];
const int button2 = currentUser[1];
const int button3 = currentUser[2];
const int button4 = currentUser[3];
const int button5 = currentUser[4];
const int button6 = currentUser[5];

const int switchLeft = 18;
const int switchRight = 19;

int buttonState1 = 1;
int buttonState2 = 1;
int buttonState3 = 1;
int buttonState4 = 1;
int buttonState5 = 1;
int buttonState6 = 1;

int buttonMode = 0;

void setup()
{
  Serial.begin(115200);
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  pinMode(button3, INPUT_PULLUP);
  pinMode(button4, INPUT_PULLUP);
  pinMode(button5, INPUT_PULLUP);
  pinMode(button6, INPUT_PULLUP);
  // Switch
  pinMode(switchLeft, INPUT_PULLUP);
  pinMode(switchRight, INPUT_PULLUP);

  nipplio.setup();
  String slotNames[] = {"Mode1-1", "Mode1-2", "Mode1-3", "Mode1-4", "Mode1-5", "Mode1-6", "Mode2-1", "Mode2-2", "Mode2-3", "Mode2-4", "Mode2-5", "Mode2-6", "Mode3-1", "Mode3-2", "Mode3-3", "Mode3-4", "Mode3-5", "Mode3-6"};
  nipplio.setSlotNames(slotNames, NUMBER_BUTTONS * NUMBER_MODES);
  //Serial.println("connected...yeey :)");
}

void setButtonDown(int button)
{
  nipplio.triggerSlotWithNumber((button + (buttonMode * NUMBER_BUTTONS)));
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

void updateSwitchMode()
{
  if (digitalRead(switchLeft) == LOW && digitalRead(switchRight) == HIGH)
  {
    // state is left
    buttonMode = 0;
  }
  else if (digitalRead(switchRight) == LOW && digitalRead(switchLeft) == HIGH)
  {
    // state is right
    buttonMode = 2;
  }
  else if (digitalRead(switchRight) == HIGH && digitalRead(switchLeft) == HIGH)
  {
    // state is center
    buttonMode = 1;
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

  updateSwitchMode();

  delay(50);
}