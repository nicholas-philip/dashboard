// src/pages/Devices.jsx
import { useSensorReadings } from "../hooks/useSensorReadings";
import { Topbar } from "../components/layout/Topbar";
import { format } from "date-fns";
import { Cpu } from "lucide-react";

export function Devices() {
  const { readings, loading } = useSensorReadings(null, 200);

  const deviceMap = readings.reduce((acc, r) => {
    if (!acc[r.device_id]) {
      acc[r.device_id] = { device_id: r.device_id, readings: [], lastSeen: r.created_at, alertCount: 0 };
    }
    acc[r.device_id].readings.push(r);
    if (r.alert_flag) acc[r.device_id].alertCount++;
    return acc;
  }, {});

  const devices = Object.values(deviceMap);

  return (
    <div className="main-content">
      <Topbar isLive={!loading} />
      <div className="scroll-area">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Active ESP32 Nodes</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>System integrity and node connectivity report</p>
        </div>

        {loading ? (
          <p>Scanning sensor network...</p>
        ) : devices.length === 0 ? (
          <p>Waiting for initial payload from remote sensors...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {devices.map((device) => {
              const avgConf = device.readings.reduce((s, r) => s + r.confidence_score, 0) / device.readings.length;
              return (
                <div key={device.device_id} className="panel" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Cpu size={20} color="var(--color-accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{device.device_id}</div>
                      <div className="status-badge" style={{ padding: "1px 0", fontSize: 10, color: "var(--color-accent)" }}>CONNECTED</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "PACKETS RECEIVED", value: device.readings.length },
                      { label: "AVG CONFIDENCE", value: `${(avgConf * 100).toFixed(1)}%` },
                      { label: "ALERTS", value: device.alertCount, color: device.alertCount > 0 ? "var(--color-danger)" : "var(--color-accent)" },
                      { label: "LAST CONTACT", value: format(device.lastSeen, "HH:mm:ss") },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)" }}>{label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: color || "var(--color-text-main)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
