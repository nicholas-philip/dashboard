// src/components/cards/StatCard.jsx
export function StatCard({ label, value, sub, accentColor = "var(--color-accent)", icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span>{label}</span>
        {Icon && <Icon size={14} color={accentColor} strokeWidth={2.5} />}
      </div>

      <div className="stat-value">
        {value}
      </div>

      {sub && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
