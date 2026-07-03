import { COLORS } from "../../constants/colors";

export function MiniBar({ percent, color }) {
  return (
    <div style={{ background: COLORS.border, borderRadius: 4, height: 6, overflow: "hidden", marginTop: 4 }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}
