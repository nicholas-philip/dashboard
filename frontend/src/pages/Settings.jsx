// src/pages/Settings.jsx
import { Topbar } from "../components/layout/Topbar";

const GROUPS = [
  {
    title: "Environment Variables",
    items: [
      { k: "API_URL", v: "http://localhost:3001" },
      { k: "ESP32_ID", v: "SITE-ALPHA-001" },
    ]
  },
  {
    title: "Seismic Configuration",
    items: [
      { k: "Threshold", v: "85% Confidence" },
      { k: "Alert Class", v: "heavy_machine" },
    ]
  }
];

export function Settings() {
  return (
    <div className="main-content">
      <Topbar isLive />
      <div className="scroll-area">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>System Configuration</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Global parameters and network settings</p>
        </div>

        <div style={{ maxWidth: 640 }}>
          {GROUPS.map((g) => (
            <div key={g.title} className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-header" style={{ padding: "14px 24px", background: "rgba(255,255,255,0.02)" }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{g.title}</span>
              </div>
              {g.items.map((it) => (
                <div key={it.k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 24px", borderTop: "1px solid var(--color-border)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{it.k}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{it.v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
