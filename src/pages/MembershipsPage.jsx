import { COLORS } from "../constants/colors";
import { memberships } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";

export function MembershipsPage({ user }) {
  const { isDesktop } = useWindowSize();
  const isMine = (m) => user.membership === m.name;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>💎 العضويات</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>مزايا كل مستوى عضوية بالأكاديمية</div>

      <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: "repeat(3,1fr)", flexDirection: "column", gap: 14 }}>
        {memberships.map((m, i) => (
          <div key={i} style={{ background: m.bg, border: `2px solid ${isMine(m) ? m.color : m.color + "33"}`, borderRadius: 18, padding: "22px", position: "relative" }}>
            {m.popular && <div style={{ position: "absolute", top: -10, right: 14, background: m.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
            {isMine(m) && <div style={{ position: "absolute", top: -10, left: 14, background: COLORS.accent, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>عضويتك الحالية</div>}
            <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ color: m.color, fontWeight: 800, fontSize: 18, marginBottom: 14 }}>عضوية {m.name}</div>
            {m.features.map((f, j) => (
              <div key={j} style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8, display: "flex", gap: 6 }}>
                <span style={{ color: m.color }}>✓</span>{f}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
