import { COLORS } from "../../constants/colors";

export function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle at top right,${color}22,transparent)` }} />
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
