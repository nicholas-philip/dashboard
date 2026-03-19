// src/pages/Alerts.jsx
import { useAlerts } from "../hooks/useAlerts";
import { AlertList } from "../components/alerts/AlertPanel";
import { Topbar } from "../components/layout/Topbar";

export function Alerts() {
  const { alerts, loading, unreadCount } = useAlerts(50);

  return (
    <div className="main-content">
      <Topbar isLive activeAlerts={unreadCount} />
      <div className="scroll-area">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Ground Activity Alarms</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Detections triggered by industrial machinery (conf ≥ 85%)</p>
        </div>
        <AlertList alerts={alerts} loading={loading} />
      </div>
    </div>
  );
}
