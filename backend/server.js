// server.js
// TerraSense API — receives POST requests from ESP32 devices,
// validates the payload, and writes to Firebase Firestore.
// ---------------------------------------------------------------

import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Firebase Admin init ─────────────────────────────────────────
// Set FIREBASE_SERVICE_ACCOUNT in .env as a JSON string, or point
// GOOGLE_APPLICATION_CREDENTIALS to the service account key file.
let firebaseApp;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  firebaseApp = initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
} else {
  // Falls back to Application Default Credentials (useful on GCP / Cloud Run)
  firebaseApp = initializeApp();
}

const db = getFirestore(firebaseApp);

// ── Express setup ───────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// ── Constants ───────────────────────────────────────────────────
const VALID_ACTIVITY_TYPES = [
  "heavy_machine",
  "small_vehicle",
  "human_walking",
  "normal",
];

// Alert triggers when activity is heavy_machine AND confidence is at or above this value
const ALERT_CONFIDENCE_THRESHOLD = parseFloat(
  process.env.ALERT_CONFIDENCE_THRESHOLD || "0.85"
);

// ── Validation helper ────────────────────────────────────────────
function validateReading(body) {
  const errors = [];

  if (!body.device_id || typeof body.device_id !== "string" || !body.device_id.trim()) {
    errors.push("device_id is required and must be a non-empty string");
  }

  if (!VALID_ACTIVITY_TYPES.includes(body.activity_type)) {
    errors.push(
      `activity_type must be one of: ${VALID_ACTIVITY_TYPES.join(", ")}`
    );
  }

  if (
    typeof body.vibration_strength !== "number" ||
    isNaN(body.vibration_strength) ||
    body.vibration_strength < 0
  ) {
    errors.push("vibration_strength must be a non-negative number");
  }

  if (
    typeof body.confidence_score !== "number" ||
    isNaN(body.confidence_score) ||
    body.confidence_score < 0 ||
    body.confidence_score > 1
  ) {
    errors.push("confidence_score must be a number between 0.0 and 1.0");
  }

  if (body.location !== undefined && body.location !== null) {
    if (
      typeof body.location.latitude  !== "number" ||
      typeof body.location.longitude !== "number"
    ) {
      errors.push("location must have numeric latitude and longitude fields");
    }
  }

  return errors;
}

// ── Routes ───────────────────────────────────────────────────────

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST /api/readings — called by ESP32 after each inference
app.post("/api/readings", async (req, res) => {
  const { device_id, activity_type, vibration_strength, confidence_score, location } = req.body;

  // 1. Validate
  const errors = validateReading(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // 2. Compute alert flag server-side
  const alert_flag =
    activity_type === "heavy_machine" &&
    confidence_score >= ALERT_CONFIDENCE_THRESHOLD;

  // 3. Build the Firestore document
  const doc = {
    device_id:         device_id.trim(),
    activity_type,
    vibration_strength,
    confidence_score,
    alert_flag,
    location:          location ?? null,
    created_at:        FieldValue.serverTimestamp(), // Always use server time
  };

  // 4. Write to Firestore
  try {
    const docRef = await db.collection("sensor_readings").add(doc);

    console.log(
      `[${new Date().toISOString()}] ${device_id} → ${activity_type} ` +
      `(conf: ${confidence_score.toFixed(2)}, alert: ${alert_flag}) — doc: ${docRef.id}`
    );

    return res.status(201).json({
      id:         docRef.id,
      alert_flag,
      message:    "Reading stored successfully",
    });
  } catch (err) {
    console.error("Firestore write error:", err);
    return res.status(500).json({ error: "Failed to store reading in Firestore" });
  }
});

// GET /api/readings — optional: fetch latest readings (for debugging / non-React clients)
app.get("/api/readings", async (req, res) => {
  try {
    const { device_id, limit = "20" } = req.query;
    let q = db
      .collection("sensor_readings")
      .orderBy("created_at", "desc")
      .limit(Math.min(parseInt(limit, 10), 100));

    if (device_id) {
      q = db
        .collection("sensor_readings")
        .where("device_id", "==", device_id)
        .orderBy("created_at", "desc")
        .limit(Math.min(parseInt(limit, 10), 100));
    }

    const snapshot = await q.get();
    const readings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate().toISOString() ?? null,
    }));

    return res.json({ readings, count: readings.length });
  } catch (err) {
    console.error("Firestore read error:", err);
    return res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// GET /api/alerts — fetch only flagged readings
app.get("/api/alerts", async (req, res) => {
  try {
    const { limit = "20" } = req.query;
    const snapshot = await db
      .collection("sensor_readings")
      .where("alert_flag", "==", true)
      .orderBy("created_at", "desc")
      .limit(Math.min(parseInt(limit, 10), 100))
      .get();

    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate().toISOString() ?? null,
    }));

    return res.json({ alerts, count: alerts.length });
  } catch (err) {
    console.error("Firestore read error:", err);
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`TerraSense API running on http://localhost:${PORT}`);
  console.log(`Alert threshold: confidence >= ${ALERT_CONFIDENCE_THRESHOLD} for heavy_machine`);
});
