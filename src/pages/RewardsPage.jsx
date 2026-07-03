import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { Avatar } from "../components/ui";

export function RewardsPage({ user, users }) {
  const [redeemed, setRedeemed] = useState([]);
  const { isDesktop } = useWindowSize();

  const rewards = [
    { name: "خصم ١٠٪ على الاشتراك", points: 500, icon: "🎫" },
    { name: "قميص الأكاديمية",       points: 800, icon: "👕" },
    { name: "حقيبة رياضية",          points: 1200, icon: "🎒" },
    { name: "إعفاء شهر كامل",        points: 2000, icon: "🎁" },
  ];

  const players = users.filter(u => u.role === "لاعب").sort((a, b) => b.points - a.points);
  const canSeeRanking = user.role === "مدير" || user.role === "مدرب";

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>⭐ المكافآت والنقاط</div>

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          {/* بطاقة النقاط */}
          <div style={{ background: "linear-gradient(135deg,#3d3000,#7a6000)", border: `1px solid ${COLORS.accentGold}44`, borderRadius: 20, padding: "26px", textAlign: "center", marginBottom: 20, boxShadow: `0 0 40px ${COLORS.accentGold}22` }}>
            <div style={{ fontSize: 12, color: COLORS.accentGold, marginBottom: 8, fontWeight: 700 }}>⭐ رصيد نقاطك</div>
            <div style={{ fontSize: isDesktop ? 60 : 52, fontWeight: 900, color: COLORS.accentGold, lineHeight: 1 }}>{user.points}</div>
            <div style={{ fontSize: 13, color: "#ffffff88", marginTop: 4 }}>نقطة</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{user.attendance}</div>
                <div style={{ fontSize: 10, color: "#ffffff66" }}>نسبة الحضور</div>
              </div>
              <div style={{ width: 1, background: "#ffffff22" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{redeemed.length}</div>
                <div style={{ fontSize: 10, color: "#ffffff66" }}>مكافآت مستبدلة</div>
              </div>
            </div>
          </div>

          {/* استبدال النقاط */}
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>🎁 استبدال النقاط</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {rewards.map((r, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${redeemed.includes(i) ? COLORS.accent : COLORS.border}`, borderRadius: 15, padding: "15px", textAlign: "center" }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 6 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: COLORS.accentGold, fontWeight: 800, marginBottom: 10 }}>⭐ {r.points}</div>
                <button onClick={() => !redeemed.includes(i) && user.points >= r.points && setRedeemed(prev => [...prev, i])}
                  style={{ width: "100%", padding: "8px", background: redeemed.includes(i) ? COLORS.accent : user.points >= r.points ? `${COLORS.accent}22` : COLORS.surface, border: `1px solid ${user.points >= r.points ? COLORS.accent : COLORS.border}`, color: redeemed.includes(i) ? "#000" : user.points >= r.points ? COLORS.accent : COLORS.textSecondary, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {redeemed.includes(i) ? "✅ تم" : user.points >= r.points ? "استبدل" : "نقاط غير كافية"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ترتيب اللاعبين - مدير ومدرب فقط */}
        <div style={{ marginTop: isDesktop ? 0 : 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>🏅 ترتيب اللاعبين</div>
          {canSeeRanking ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {players.map((p, i) => (
                <div key={p.id} style={{ background: p.id === user.id ? `${COLORS.accent}10` : COLORS.cardBg, border: `1px solid ${p.id === user.id ? COLORS.accent + "55" : COLORS.border}`, borderRadius: 13, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? COLORS.accentGold : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: i < 3 ? "#000" : COLORS.textSecondary }}>{i + 1}</div>
                  <Avatar letter={p.name[0]} size={34} color={p.id === user.id ? COLORS.accent : COLORS.textSecondary} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name} {p.id === user.id ? "👈" : ""}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.position} · حضور {p.attendance}٪</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? COLORS.accentGold : COLORS.textPrimary }}>{p.points}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary }}>نقطة</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "30px", textAlign: "center", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div>ترتيب اللاعبين للمدير والمدرب فقط</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
