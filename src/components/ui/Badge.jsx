export function Badge({ text, color }) {
  return <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</span>;
}
