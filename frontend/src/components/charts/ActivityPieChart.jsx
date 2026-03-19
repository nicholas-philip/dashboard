// src/components/charts/ActivityPieChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["var(--color-accent)", "#ff3b30", "#ff9500", "#5856d6", "#ff2d55"];

export function ActivityPieChart({ readings }) {
  const counts = readings.reduce((acc, r) => {
    acc[r.activity_type] = (acc[r.activity_type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="panel" style={{ padding: "24px" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 20px 0" }}>Activity Mix</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 20 }}>
        {data.map(({ name, value }, index) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[index % COLORS.length] }} />
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {name.replace("_", " ")}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
