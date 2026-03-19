// esp32_terrasense.ino
// ---------------------------------------------------------------
// TerraSense ESP32 firmware
// Reads MPU6050 vibration data, runs Edge Impulse TinyML model,
// and POSTs classification results to the TerraSense Node.js API.
//
// Dependencies (install via Arduino Library Manager):
//   - Adafruit MPU6050
//   - Adafruit Unified Sensor
//   - ArduinoJson
//   - Your Edge Impulse exported Arduino library
// ---------------------------------------------------------------

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ── Replace with your Edge Impulse exported library header ──────
// #include <your_project_name_inferencing.h>

// ── Configuration ───────────────────────────────────────────────
const char* WIFI_SSID       = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD   = "YOUR_WIFI_PASSWORD";
const char* API_ENDPOINT    = "http://YOUR_SERVER_IP:3001/api/readings";
const char* DEVICE_ID       = "ESP32-SITE-001";

// Optional: set GPS coordinates for this sensor's fixed location
const float LOCATION_LAT    = 5.6037;
const float LOCATION_LNG    = -0.1870;
const bool  HAS_LOCATION    = true;

// Inference window: collect samples for this many ms before classifying
const int   SAMPLE_MS       = 1000;
const int   SAMPLE_RATE_HZ  = 100;

// ── Globals ─────────────────────────────────────────────────────
Adafruit_MPU6050 mpu;

// Class labels — must match your Edge Impulse training order
const char* CLASS_LABELS[] = {
  "heavy_machine",
  "human_walking",
  "normal",
  "small_vehicle",
};
const int NUM_CLASSES = 4;

// ── Setup ────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("[TerraSense] Booting...");

  // Init MPU6050
  if (!mpu.begin()) {
    Serial.println("[ERROR] MPU6050 not found. Check wiring (SDA=21, SCL=22).");
    while (true) delay(1000);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.println("[OK] MPU6050 initialised");

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("[WiFi] Connected — IP: ");
  Serial.println(WiFi.localIP());
}

// ── Main loop ────────────────────────────────────────────────────
void loop() {
  // 1. Collect raw accelerometer samples over SAMPLE_MS window
  int   numSamples = SAMPLE_RATE_HZ * (SAMPLE_MS / 1000);
  float samples[300][3];  // [sample][x,y,z] — adjust size to match your EI window
  float magnitudes[300];
  int   sampleCount = 0;

  unsigned long startMs = millis();
  while (millis() - startMs < SAMPLE_MS && sampleCount < numSamples) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    samples[sampleCount][0] = a.acceleration.x;
    samples[sampleCount][1] = a.acceleration.y;
    samples[sampleCount][2] = a.acceleration.z;

    // Magnitude = Euclidean norm of acceleration vector
    magnitudes[sampleCount] = sqrt(
      pow(a.acceleration.x, 2) +
      pow(a.acceleration.y, 2) +
      pow(a.acceleration.z, 2)
    );

    sampleCount++;
    delay(1000 / SAMPLE_RATE_HZ);
  }

  // 2. Compute average vibration strength from this window
  float totalMag = 0;
  for (int i = 0; i < sampleCount; i++) totalMag += magnitudes[i];
  float vibrationStrength = totalMag / sampleCount;

  // Normalise to 0.0–1.0 (adjust divisor to your sensor's expected range)
  vibrationStrength = constrain(vibrationStrength / 20.0, 0.0, 1.0);

  // ── 3. Run Edge Impulse TinyML inference ──────────────────────
  // Uncomment and adapt the block below once your EI library is imported.
  //
  // ei_impulse_result_t result = { 0 };
  // signal_t signal;
  // numpy::signal_from_buffer(rawBuffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
  // run_classifier(&signal, &result, false);
  //
  // int    bestIdx   = 0;
  // float  bestConf  = 0;
  // for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
  //   if (result.classification[i].value > bestConf) {
  //     bestConf = result.classification[i].value;
  //     bestIdx  = i;
  //   }
  // }
  // const char* activityType  = result.classification[bestIdx].label;
  // float       confidenceScore = bestConf;

  // ── PLACEHOLDER (remove when EI library is wired up) ──────────
  // Simulates a classification result for testing the API pipeline.
  const char* activityType   = CLASS_LABELS[random(0, NUM_CLASSES)];
  float       confidenceScore = 0.70 + (random(0, 30) / 100.0);
  // ──────────────────────────────────────────────────────────────

  Serial.printf("[Classify] %s (conf: %.2f, strength: %.3f)\n",
    activityType, confidenceScore, vibrationStrength);

  // 4. Build JSON payload
  StaticJsonDocument<256> payload;
  payload["device_id"]         = DEVICE_ID;
  payload["activity_type"]     = activityType;
  payload["vibration_strength"] = vibrationStrength;
  payload["confidence_score"]  = confidenceScore;

  if (HAS_LOCATION) {
    JsonObject loc = payload.createNestedObject("location");
    loc["latitude"]  = LOCATION_LAT;
    loc["longitude"] = LOCATION_LNG;
  }

  String jsonStr;
  serializeJson(payload, jsonStr);

  // 5. POST to TerraSense API
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonStr);

    if (httpCode == 201) {
      Serial.println("[API] Reading stored successfully");
    } else {
      Serial.printf("[API] Error %d: %s\n", httpCode, http.getString().c_str());
    }

    http.end();
  } else {
    Serial.println("[WiFi] Disconnected — skipping POST");
    WiFi.reconnect();
  }

  // 6. Wait before next inference window
  delay(2000);
}
