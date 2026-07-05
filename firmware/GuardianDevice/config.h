#ifndef CONFIG_H
#define CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

// ==========================================
// BLE CONFIGURATION
// ==========================================
#define DEVICE_NAME "Guardian_Device"

// Generated UUIDs for BLE Service and SOS Characteristic
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// ==========================================
// HARDWARE PINS
// ==========================================
#define SOS_BUTTON_PIN 33      // User's training board SW1 -> GPIO 33
#define BATTERY_ADC_PIN 34     // (Optional) TP4056 / battery voltage via voltage divider

// ==========================================
// TIMINGS
// ==========================================
#define SOS_DEBOUNCE_DELAY_MS 50   // 50ms standard debounce
#define SOS_HOLD_TIME_MS 2000      // 2 seconds hold to trigger SOS
#define BLE_ADVERTISE_TIME_MS 300000 // Advertise for 5 minutes then sleep

#ifdef __cplusplus
}
#endif

#endif // CONFIG_H
