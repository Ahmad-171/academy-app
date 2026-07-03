import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { StatCard, Avatar, Badge } from "../components/ui";

export function HomePage({ onNav, user, users, directorMsg, setDirectorMsg, membershipPlans }) {
  const [visible, setVisible] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [tempMsg, setTempMsg] = useState(directorMsg);
  const { isDesktop } = useWindowSize();
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const players = users.filter(u => u.role === "لاعب");
  const coaches = users.filter(u => u.role === "مدرب");
  const avgAtt  = players.length ? Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length) : 0;
  const canEditMsg = user.role === "مدير";

  return (
    <div style={{ padding: isDesktop ? "32px" : "0 0 40px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2044 50%,#0a1628 100%)", padding: isDesktop ? "40px 48px" : "32px 18px 26px", position: "relative", overflow: "hidden", borderBottom: `1px solid ${COLORS.border}`, borderRadius: isDesktop ? 20 : 0, marginBottom: isDesktop ? 24 : 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)` }} />

        <div style={{ display: "flex", gap: 24, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: isDesktop ? 64 : 54, height: isDesktop ? 64 : 54, background: "linear-gradient(135deg,#00c896,#0066cc)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDesktop ? 30 : 26, boxShadow: "0 0 30px #00c89644", opacity: visible ? 1 : 0, transition: "all 0.6s ease" }}>⚽</div>
              <div>
                <div style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 900, color: COLORS.textPrimary }}>أكاديمية النجوم</div>
                <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, marginTop: 2 }}>ACADEMY OF STARS</div>
              </div>
            </div>
            {/* بطاقة المستخدم */}
            <div style={{ background: "#ffffff0a", border: "1px solid #ffffff10", borderRadius: 16, padding: "14px 18px", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={user.name[0]} size={44} color={user.role === "مدير" ? COLORS.purple : user.role === "مدرب" ? COLORS.accentGold : user.role === "ولي أمر" ? COLORS.accentBlue : COLORS.accent} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>{user.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{user.customRole || user.role}{user.position !== "-" ? ` · ${user.position}` : ""}</div>
                {user.membership !== "-" && <div style={{ marginTop: 4 }}><Badge text={`عضوية ${user.membership}`} color={COLORS.accentGold} /></div>}
              </div>
            </div>
          </div>

          {/* رسالة المدير */}
          <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 16, padding: "18px 20px", width: isDesktop ? 360 : "100%", position: "relative" }}>
            <div style={{ fontSize: 11, color: COLORS.accentGold, marginBottom: 8, fontWeight: 700 }}>💬 رسالة المدير</div>
            {editMsg ? (
              <div>
                <textarea value={tempMsg} onChange={e => setTempMsg(e.target.value)} rows={3}
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { setDirectorMsg(tempMsg); setEditMsg(false); }} style={{ flex: 1, padding: "8px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: 12 }}>✅ حفظ</button>
                  <button onClick={() => { setTempMsg(directorMsg); setEditMsg(false); }} style={{ flex: 1, padding: "8px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, cursor: "pointer", fontSize: 12 }}>إلغاء</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.8 }}>"{directorMsg}"</div>
                {canEditMsg && <button onClick={() => { setTempMsg(directorMsg); setEditMsg(true); }} style={{ position: "absolute", top: 12, left: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>✏️</button>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* إحصائيات حقيقية */}
      <div style={{ padding: isDesktop ? "0" : "16px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12, marginBottom: 22 }}>
          <StatCard label="لاعب مسجل" value={String(players.length)} icon="⚽" color={COLORS.accent} sub={`${players.filter(p => p.status !== "موقوف").length} نشط`} />
          <StatCard label="مدرب" value={String(coaches.length)} icon="🏅" color={COLORS.accentGold} sub="في الأكاديمية" />
          <StatCard label="متوسط الحضور" value={`${avgAtt}٪`} icon="📊" color={COLORS.accentBlue} sub="هذا الموسم" />
          <StatCard label="ولي أمر" value={String(users.filter(u => u.role === "ولي أمر").length)} icon="👨‍👦" color={COLORS.purple} sub="مسجل" />
        </div>

        {/* العضويات */}
        <div style={{ fontSize: isDesktop ? 19 : 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>العضويات</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 }}>اختر الباقة المناسبة</div>
        <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : undefined, gap: 12, overflowX: isDesktop ? "visible" : "auto", paddingBottom: 8 }}>
          {membershipPlans.map((m, i) => (
            <div key={i} style={{ minWidth: isDesktop ? "unset" : 182, borderRadius: 18, background: m.bg, border: `1px solid ${m.color}44`, padding: "16px 14px", position: "relative", flexShrink: 0 }}>
              {m.popular && <div style={{ position: "absolute", top: -10, right: 12, background: m.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
              <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ color: m.color, fontWeight: 800, fontSize: 14 }}>{m.name}</div>
              <div style={{ color: COLORS.textPrimary, fontSize: 19, fontWeight: 900, margin: "5px 0" }}>{m.price} <span style={{ fontSize: 10, color: COLORS.textSecondary }}>ر.س/شهر</span></div>
              {m.features.map((f, j) => <div key={j} style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 4, display: "flex", gap: 4 }}><span style={{ color: m.color }}>✓</span>{f}</div>)}
              <button onClick={() => onNav("subscriptions")} style={{ marginTop: 12, width: "100%", padding: "8px", background: `${m.color}22`, border: `1px solid ${m.color}55`, color: m.color, borderRadius: 9, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>اشترك</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
