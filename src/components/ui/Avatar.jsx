import { COLORS } from "../../constants/colors";

export function Avatar({ letter, size = 40, color = COLORS.accent }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${color}44,${color}22)`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>{letter}</div>
  );
}
