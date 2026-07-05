#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "config.h"
#include "button_handler.h"

ButtonHandler buttonHandler;

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long wakeTimestamp = 0;
bool sosSent = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      // Reset wake timer — stay awake while app is connected
      wakeTimestamp = millis();
      Serial.println(">>> Phone App Connected! <<<");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Phone App Disconnected. Restarting advertising...");
      // Restart advertising so app can reconnect
      BLEDevice::startAdvertising();
    }
};

void setupBLE() {
    Serial.println("Starting BLE Server...");
    BLEDevice::init(DEVICE_NAME);
    BLEDevice::setPower(ESP_PWR_LVL_P9); // Max TX power for better range

    // Create the BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create the BLE Service
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Create a BLE Characteristic for SOS notification
    pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

    pCharacteristic->addDescriptor(new BLE2902());
    pCharacteristic->setValue("READY");

    pService->start();

    // Start advertising with device name visible
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);  // true = device name visible in scan
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMaxPreferred(0x12);
    BLEDevice::startAdvertising();

    Serial.println("BLE Advertising Started. Device visible as: " DEVICE_NAME);
    Serial.println("Waiting for Guardian app to connect...");
}

void goToDeepSleep() {
    Serial.println("No connection. Going to deep sleep...");
    Serial.println("Press SOS button to wake up and advertise again.");

    // Stop BLE before sleeping
    BLEDevice::deinit(true);
    delay(200);

    // Wake up when button goes HIGH (pressed)
    esp_sleep_enable_ext0_wakeup((gpio_num_t)SOS_BUTTON_PIN, 1);
    delay(500);
    esp_deep_sleep_start();
}

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println("=========================================");
    Serial.println("  Guardian Device BLE Firmware v2.0");
    Serial.println("=========================================");

    // Show wakeup reason
    esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
    if (wakeup_reason == ESP_SLEEP_WAKEUP_EXT0) {
        Serial.println("Woken by SOS Button press.");
    } else {
        Serial.println("Power-on / Reset boot.");
    }

    buttonHandler.init();
    setupBLE();

    wakeTimestamp = millis();
}

void loop() {
    buttonHandler.update();

    // === SOS TRIGGER ===
    if (buttonHandler.isSOSActivated() && !sosSent) {
        Serial.println(">>> SOS BUTTON HELD! <<<");
        if (deviceConnected) {
            Serial.println("Sending SOS notification to phone...");
            pCharacteristic->setValue("SOS");
            pCharacteristic->notify();
            sosSent = true;
            Serial.println("SOS sent successfully!");
            // We intentionally DO NOT deep sleep here. 
            // We stay awake as long as the phone remains connected.
            wakeTimestamp = millis(); 
        } else {
            Serial.println("SOS pressed but phone not connected. Keep trying...");
            // Don't sleep — keep advertising so phone can connect
            wakeTimestamp = millis();
        }
        buttonHandler.resetSOS();
    }

    // === RECONNECT HANDLING ===
    if (!deviceConnected && oldDeviceConnected) {
        oldDeviceConnected = false;
        // Reset SOS so user can trigger again after reconnect
        sosSent = false;
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = true;
        sosSent = false;
    }

    // === SLEEP TIMEOUT (only when not connected) ===
    if (!deviceConnected && (millis() - wakeTimestamp > BLE_ADVERTISE_TIME_MS)) {
        goToDeepSleep();
    }

    delay(20);
}
