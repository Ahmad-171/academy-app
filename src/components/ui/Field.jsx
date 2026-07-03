import { COLORS } from "../../constants/colors";

export function Field({ label, value, onChange, type = "text", options, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
      )}
    </div>
  );
}
