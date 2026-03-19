// src/components/charts/TimeSeriesChart.jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ 
      background: "#000", border: "1px solid #222", borderRadius: 4, 
      padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 
    }}>
      <div style={{ color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#fff" }}>STRENGTH: <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{d.strength?.toFixed(3)}</span></div>
      <div style={{ color: "#888", fontSize: 10, marginTop: 4 }}>{d.activity_type.toUpperCase()}</div>
    </div>
  );
};

export function TimeSeriesChart({ readings }) {
  const data = [...readings].reverse().map((r) => ({
    time: format(r.created_at, "HH:mm:ss"),
    strength: r.vibration_strength,
    activity_type: r.activity_type.replace("_", " "),
  }));

  return (
    <div className="panel" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Ground Motion Signal</h3>
          <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>VIBRATION MAGNITUDE (G-FORCE)</p>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)" }}>
          <div style={{ color: "var(--color-accent)" }}>● LIVE DATA</div>
          <div style={{ color: "#ff3b30" }}>-- ALARM</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: "#666", fontSize: 10, fontFamily: "var(--font-mono)" }} 
            axisLine={{ stroke: "#1a1a1a" }} 
            tickLine={false}
          />
          <YAxis 
            domain={[0, 1]} 
            tick={{ fill: "#666", fontSize: 10, fontFamily: "var(--font-mono)" }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0.75} stroke="#ff3b30" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Line 
            type="monotone" 
            dataKey="strength" 
            stroke="var(--color-accent)" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-accent)" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
