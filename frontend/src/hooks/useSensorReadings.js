// src/hooks/useSensorReadings.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Subscribes to the latest sensor_readings in real time.
 * @param {string|null} deviceId  - Filter by a specific ESP32 device ID (or null for all)
 * @param {number}      maxResults - Maximum number of readings to stream (default 100)
 * @returns {{ readings: Array, loading: boolean, error: string|null }}
 */
export function useSensorReadings(deviceId = null, maxResults = 100) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);

    let q = query(
      collection(db, "sensor_readings"),
      orderBy("created_at", "desc"),
      limit(maxResults)
    );

    if (deviceId) {
      q = query(
        collection(db, "sensor_readings"),
        where("device_id", "==", deviceId),
        orderBy("created_at", "desc"),
        limit(maxResults)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp → JS Date for charts and formatting
          created_at: doc.data().created_at?.toDate() ?? new Date(),
        }));
        setReadings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts or deps change
    return () => unsubscribe();
  }, [deviceId, maxResults]);

  return { readings, loading, error };
}
