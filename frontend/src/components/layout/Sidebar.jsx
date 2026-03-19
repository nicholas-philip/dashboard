// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bell, Activity, Settings, Zap } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/devices", icon: Activity, label: "Devices" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ unreadAlerts = 0 }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--color-accent)", display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={16} color="#080c10" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>TerraSense</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.1em" }}>SEISMIC MONITOR</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
                {label === "Alerts" && unreadAlerts > 0 && (
                  <span className="badge-danger" style={{ marginLeft: "auto", background: "var(--color-danger)", color: "white", borderRadius: 10, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>
                    {unreadAlerts}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 24, borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
        v1.0.0 · SITE-001
      </div>
    </aside>
  );
}
