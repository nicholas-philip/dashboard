// src/components/feed/ActivityFeed.jsx
import { format } from "date-fns";
import { AlertTriangle, Activity } from "lucide-react";

const ACTIVITY_FLAGS = {
  heavy_machine: { color: "#ff3b30", label: "HEAVY MACHINE" },
  small_vehicle: { color: "#f59e0b", label: "SMALL VEHICLE" },
  human_walking: { color: "var(--color-accent)", label: "PERSON WALKING" },
  normal:        { color: "var(--color-text-dim)", label: "BACKGROUND" },
};

export function ActivityFeed({ readings, loading }) {
  if (loading) return (
    <div style={{ padding: 80, textAlign: "center", color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}>
      SYNCHRONIZING READINGS...
    </div>
  );

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="panel-header" style={{ padding: "14px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={14} color="var(--color-accent)" />
          Detection History
        </h3>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{readings.length} NODES LOGGED</div>
      </div>

      <div className="table-header" style={{ padding: "10px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 120px 100px 40px", width: "100%" }}>
          {["SIGNATURE", "DEVICE", "VIBRATION", "CONFIDENCE", "HH:MM:SS", ""].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {readings.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-dim)", fontStyle: "italic" }}>
            No ground activity detected in current session.
          </div>
        ) : (
          readings.map((r, i) => {
            const flag = ACTIVITY_FLAGS[r.activity_type] || ACTIVITY_FLAGS.normal;
            return (
              <div key={r.id} className="table-row" style={{ 
                padding: "12px 24px", 
                backgroundColor: r.alert_flag ? "#ff3b3008" : "transparent"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 120px 100px 40px", width: "100%", alignItems: "center" }}>
                  <div style={{ 
                    display: "flex", alignItems: "center", gap: 10, 
                    color: flag.color, fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)"
                  }}>
                    <div className="dot" style={{ background: flag.color }} />
                    {flag.label}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{r.device_id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.vibration_strength?.toFixed(3)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: flag.color }}>
                    {(r.confidence_score * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    {format(r.created_at, "HH:mm:ss")}
                  </span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {r.alert_flag && <AlertTriangle size={14} color="#ff3b30" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
