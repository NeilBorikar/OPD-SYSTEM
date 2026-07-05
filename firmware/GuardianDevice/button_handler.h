#ifndef BUTTON_HANDLER_H
#define BUTTON_HANDLER_H

#include <Arduino.h>

class ButtonHandler {
public:
    ButtonHandler();
    void init();
    void update();
    bool isSOSActivated();
    void resetSOS();

private:
    bool sosActivated;
    unsigned long buttonPressTimestamp;
    bool isPressed;
};

#endif // BUTTON_HANDLER_H
