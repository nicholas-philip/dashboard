// src/components/alerts/AlertPanel.jsx
import { format } from "date-fns";
import { AlertTriangle, X } from "lucide-react";

export function AlertBanner({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;
  const latest = alerts[0];

  return (
    <div className="panel" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 24px", background: "var(--color-danger-soft)",
      border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 12, marginBottom: 24
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <AlertTriangle size={18} color="var(--color-danger)" strokeWidth={2.5} />
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>
            ALARM: HEAVY MACHINERY DETECTED
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(244, 63, 94, 0.8)", marginTop: 2 }}>
            DEVICE: {latest.device_id} · CONFIDENCE: {(latest.confidence_score * 100).toFixed(1)}% · {format(latest.created_at, "HH:mm:ss")}
          </div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-danger)", opacity: 0.6 }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function AlertList({ alerts, loading }) {
  if (loading) return <div style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Retreiving alert history...</div>;

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="var(--color-danger)" />
          <h3 className="panel-title">Active Alert Log</h3>
        </div>
        <div className="status-badge" style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}>
          {alerts.length} TRIGGERS
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {alerts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            System state: NOMINAL. No heavy industrial activity detected.
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div key={alert.id} className="table-row" style={{
              display: "flex", justifyContent: "space-between",
              background: i === 0 ? "rgba(244, 63, 94, 0.03)" : "transparent"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-danger)" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{alert.device_id}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                    CONF: {(alert.confidence_score * 100).toFixed(0)}% · VIB: {alert.vibration_strength?.toFixed(3)}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                {format(alert.created_at, "HH:mm:ss · dd MMM")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
