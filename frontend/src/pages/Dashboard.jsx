// src/pages/Dashboard.jsx
import { useSensorReadings } from "../hooks/useSensorReadings";
import { useAlerts } from "../hooks/useAlerts";
import { StatCardGrid } from "../components/cards/StatCardGrid";
import { AlertBanner } from "../components/alerts/AlertPanel";
import { ActivityFeed } from "../components/feed/ActivityFeed";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";
import { ActivityPieChart } from "../components/charts/ActivityPieChart";
import { Topbar } from "../components/layout/Topbar";
import { useState } from "react";

export function Dashboard() {
  const { readings, loading } = useSensorReadings(null, 50);
  const { alerts, unreadCount } = useAlerts(10);
  const [showLatestAlert, setShowLatestAlert] = useState(true);

  const lastSeen = readings.length > 0 ? readings[0].created_at : null;

  return (
    <div className="main-content">
      <Topbar isLive={!loading} activeAlerts={unreadCount} lastSeen={lastSeen} />

      <div className="scroll-area">
        {showLatestAlert && alerts.length > 0 && (
          <AlertBanner
            alerts={alerts.slice(0, 1)}
            onDismiss={() => setShowLatestAlert(false)}
          />
        )}

        <StatCardGrid readings={readings} />

        <div className="chart-section" style={{ marginBottom: 32 }}>
          <TimeSeriesChart readings={readings} />
          <ActivityPieChart readings={readings} />
        </div>

        <ActivityFeed readings={readings} loading={loading} />
      </div>
    </div>
  );
}
