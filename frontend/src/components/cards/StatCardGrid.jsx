// src/components/cards/StatCardGrid.jsx
import { StatCard } from "./StatCard";
import { Activity, AlertTriangle, Cpu, TrendingUp } from "lucide-react";

export function StatCardGrid({ readings }) {
  const total      = readings.length;
  const alerts     = readings.filter((r) => r.alert_flag).length;
  const avgConf    = total
    ? (readings.reduce((s, r) => s + r.confidence_score, 0) / total).toFixed(2)
    : "—";
  const devices    = [...new Set(readings.map((r) => r.device_id))].length;
  const heavyCount = readings.filter((r) => r.activity_type === "heavy_machine").length;

  return (
    <div className="card-grid">
      <StatCard label="Total Readings"  value={total}    sub="in current window"          accentColor="#0ea5e9"  icon={Activity}      />
      <StatCard label="Active Alerts"   value={alerts}   sub="heavy_machine ≥ 0.85 conf"  accentColor="#f43f5e" icon={AlertTriangle}  />
      <StatCard label="Avg Confidence"  value={avgConf}  sub="model certainty score"       accentColor="var(--color-accent)" icon={TrendingUp}     />
      <StatCard label="Active Devices"  value={devices}  sub={`${heavyCount} heavy events detected`} accentColor="#f59e0b" icon={Cpu} />
    </div>
  );
}
