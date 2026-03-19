# TerraSense — Underground Vibration Monitor

A full-stack IoT system that detects and classifies underground vibrations using an ESP32 + MPU6050 sensor, a TinyML model trained with Edge Impulse, a Node.js API, Firebase Firestore, and a real-time React dashboard.

---

## System Architecture

```
MPU6050 → ESP32 (TinyML) → Node.js API → Firestore → React Dashboard
                                              ↑
                                       onSnapshot()
                                    (real-time push)
```

---

## Project Structure

```
terrasense/
├── frontend/               React dashboard (Create React App + Tailwind + Recharts)
│   ├── src/
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── hooks/
│   │   │   ├── useSensorReadings.js
│   │   │   └── useAlerts.js
│   │   ├── components/
│   │   │   ├── layout/     Sidebar, Topbar
│   │   │   ├── cards/      StatCard, StatCardGrid
│   │   │   ├── charts/     TimeSeriesChart, ActivityPieChart
│   │   │   ├── feed/       ActivityFeed
│   │   │   └── alerts/     AlertBanner, AlertList
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Alerts.jsx
│   │       ├── Devices.jsx
│   │       └── Settings.jsx
│   └── .env.example
│
├── backend/                Node.js Express API
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── esp32/
│   └── esp32_terrasense.ino
│
├── firestore.rules         Firestore security rules
└── firestore.indexes.json  Composite indexes for efficient queries
```

---

## 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore Database** (start in production mode).
3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```
5. Go to **Project Settings → Service Accounts** and generate a new private key JSON file for the backend.
6. Go to **Project Settings → General → Your apps** and register a Web App to get the frontend config values.

---

## 2. Backend (Node.js API)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: paste your Firebase service account JSON and set PORT/CORS_ORIGIN
npm start
```

The API exposes:

| Method | Route            | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/health`        | Health check                             |
| POST   | `/api/readings`  | Receive and store ESP32 inference result |
| GET    | `/api/readings`  | Fetch latest readings (debug)            |
| GET    | `/api/alerts`    | Fetch alert-flagged readings             |

### Example POST body from ESP32:
```json
{
  "device_id":          "ESP32-SITE-001",
  "activity_type":      "heavy_machine",
  "vibration_strength": 0.847,
  "confidence_score":   0.923,
  "location": {
    "latitude":  5.6037,
    "longitude": -0.1870
  }
}
```

### Alert logic:
`alert_flag` is set to `true` when:
- `activity_type === "heavy_machine"` AND
- `confidence_score >= 0.85` (configurable via `ALERT_CONFIDENCE_THRESHOLD` in `.env`)

---

## 3. Frontend (React Dashboard)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: fill in your Firebase web app config values
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Pages:
| Route       | Page       | Description                                      |
|-------------|------------|--------------------------------------------------|
| `/`         | Dashboard  | Live charts, stat cards, activity feed, alerts   |
| `/alerts`   | Alerts     | Historical log of all alert-flagged readings     |
| `/devices`  | Devices    | Per-device stats (readings, confidence, last seen)|
| `/settings` | Settings   | Config reference (env vars, thresholds, labels)  |

### Real-time updates:
All components subscribe to Firestore via `onSnapshot()`. When the ESP32 posts a new reading:
1. The Node.js API writes it to Firestore.
2. Firestore pushes the diff to all active dashboard clients instantly.
3. React re-renders `ActivityFeed`, `TimeSeriesChart`, `AlertPanel`, and `StatCards` — no polling, no page refresh.

---

## 4. ESP32 Firmware

Open `esp32/esp32_terrasense.ino` in the Arduino IDE.

### Hardware:
```
ESP32       MPU6050
3.3V   →   VCC
GND    →   GND
GPIO21 →   SDA
GPIO22 →   SCL
```

### Required libraries (Arduino Library Manager):
- `Adafruit MPU6050`
- `Adafruit Unified Sensor`
- `ArduinoJson`
- Your Edge Impulse exported Arduino library

### Steps:
1. Export your trained Edge Impulse model as an Arduino library.
2. Import it into the Arduino IDE.
3. Uncomment the inference block in `loop()` and remove the placeholder.
4. Set `WIFI_SSID`, `WIFI_PASSWORD`, `API_ENDPOINT`, and `DEVICE_ID`.
5. Flash to your ESP32.

---

## 5. Firestore Data Schema

Collection: `sensor_readings`

| Field               | Type      | Description                                          |
|---------------------|-----------|------------------------------------------------------|
| `id`                | string    | Auto-generated document ID                          |
| `created_at`        | timestamp | Server timestamp (never device clock)               |
| `device_id`         | string    | ESP32 identifier e.g. `"ESP32-SITE-001"`            |
| `activity_type`     | string    | TinyML label: `heavy_machine`, `small_vehicle`, etc.|
| `vibration_strength`| number    | Normalised MPU6050 magnitude 0.0–1.0                |
| `confidence_score`  | number    | Model softmax probability 0.0–1.0                   |
| `location`          | object    | `{ latitude, longitude }` or null                   |
| `alert_flag`        | boolean   | True when heavy_machine + confidence ≥ threshold     |

---

## 6. Classification Labels

| Label           | Description                          |
|-----------------|--------------------------------------|
| `heavy_machine` | Excavators, bulldozers, pile drivers |
| `small_vehicle` | Cars, motorcycles, light trucks      |
| `human_walking` | Footsteps, light surface activity    |
| `normal`        | Ambient / no significant vibration   |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable                     | Description                                      |
|------------------------------|--------------------------------------------------|
| `FIREBASE_SERVICE_ACCOUNT`   | Firebase Admin service account JSON (string)    |
| `PORT`                       | API server port (default: 3001)                 |
| `CORS_ORIGIN`                | Allowed CORS origin (default: `*`)              |
| `ALERT_CONFIDENCE_THRESHOLD` | Min confidence for alert flag (default: `0.85`) |

### Frontend (`frontend/.env`)
| Variable                              | Description                    |
|---------------------------------------|--------------------------------|
| `REACT_APP_FIREBASE_API_KEY`          | Firebase Web API key           |
| `REACT_APP_FIREBASE_AUTH_DOMAIN`      | Firebase auth domain           |
| `REACT_APP_FIREBASE_PROJECT_ID`       | Firebase project ID            |
| `REACT_APP_FIREBASE_STORAGE_BUCKET`   | Firebase storage bucket        |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID|
| `REACT_APP_FIREBASE_APP_ID`           | Firebase app ID                |
| `REACT_APP_API_URL`                   | Node.js API URL                |
