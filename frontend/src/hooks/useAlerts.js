// src/hooks/useAlerts.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Subscribes to sensor_readings where alert_flag === true.
 * @param {number} maxResults - Max alerts to stream (default 20)
 * @returns {{ alerts: Array, loading: boolean, unreadCount: number }}
 */
export function useAlerts(maxResults = 20) {
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "sensor_readings"),
      where("alert_flag", "==", true),
      orderBy("created_at", "desc"),
      limit(maxResults)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() ?? new Date(),
      }));
      setAlerts(data);
      setUnreadCount(data.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxResults]);

  const clearUnread = () => setUnreadCount(0);

  return { alerts, loading, unreadCount, clearUnread };
}
