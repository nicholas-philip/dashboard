// src/components/layout/Topbar.jsx
import { format } from "date-fns";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

export function Topbar({ isLive = true, activeAlerts = 0, lastSeen = null }) {
  return (
    <header className="topbar">
      <div>
        <h1>Mission Analytics</h1>
        <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2, fontFamily: "var(--font-mono)", opacity: 0.6 }}>
          {lastSeen 
            ? `LAST ACTIVITY: ${format(lastSeen, "HH:mm:ss")}`
            : "SYNCHRONIZING..."}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {activeAlerts > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-danger)", fontSize: 11, fontWeight: 700 }}>
            <AlertTriangle size={14} />
            {activeAlerts} ACTIVE ALERTS
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isLive ? (
            <>
              <div className="dot pulse" style={{ background: "var(--color-accent)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "var(--color-accent)" }}>LIVE STREAM</span>
              <Wifi size={14} color="var(--color-accent)" />
            </>
          ) : (
            <>
              <WifiOff size={14} color="var(--color-text-dim)" />
              <span style={{ fontSize: 11, color: "var(--color-text-dim)" }}>OFFLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
