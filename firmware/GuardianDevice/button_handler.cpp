#include "button_handler.h"
#include "config.h"

ButtonHandler::ButtonHandler() {
    sosActivated = false;
    isPressed = false;
    buttonPressTimestamp = 0;
}

void ButtonHandler::init() {
    pinMode(SOS_BUTTON_PIN, INPUT_PULLDOWN); // Ensure button pulls HIGH when pressed
}

void ButtonHandler::update() {
    int state = digitalRead(SOS_BUTTON_PIN);
    
    if (state == HIGH) {
        if (!isPressed) {
            isPressed = true;
            buttonPressTimestamp = millis();
        } else {
            if (millis() - buttonPressTimestamp > SOS_HOLD_TIME_MS) {
                // Button held long enough
                if (!sosActivated) {
                    Serial.println("SOS BUTTON LONG PRESS DETECTED!");
                    sosActivated = true;
                }
            }
        }
    } else {
        isPressed = false;
    }
}

bool ButtonHandler::isSOSActivated() {
    return sosActivated;
}

void ButtonHandler::resetSOS() {
    sosActivated = false;
}
