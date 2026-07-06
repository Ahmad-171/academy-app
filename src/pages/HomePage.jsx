import { useState, useEffect } from "react";
import { uploadMedia } from "../lib/media";
import { COLORS } from "../constants/colors";
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { StatCard, Avatar, Badge } from "../components/ui";
import { Logo } from "../components/Logo";

export function HomePage({ onNav, user, users, directorMsg, setDirectorMsg, heroBg, setHeroBg }) {
  const [visible, setVisible] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [tempMsg, setTempMsg] = useState(directorMsg);
  const [bgUploading, setBgUploading] = useState(false);
  const { isDesktop } = useWindowSize();
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const players = users.filter(u => u.role === "لاعب");
  const coaches = users.filter(u => u.role === "مدرب");
  const avgAtt  = players.length ? Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length) : 0;
  const canEditMsg = user.role === "مدير";

  const changeBg = async (file) => {
    if (!file) return;
    setBgUploading(true);
    const { url, error } = await uploadMedia(file, "hero");
    if (!error && url) await setHeroBg(url);
    setBgUploading(false);
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "0 0 40px" }}>
      {/* Hero */}
      <div style={{ background: heroBg ? `linear-gradient(160deg,#0a1628cc 0%,#0d2044aa 50%,#0a1628cc 100%), url(${heroBg}) center/cover no-repeat` : "linear-gradient(160deg,#0a1628 0%,#0d2044 50%,#0a1628 100%)", padding: isDesktop ? "40px 48px" : "32px 18px 26px", position: "relative", overflow: "hidden", borderBottom: `1px solid ${COLORS.border}`, borderRadius: isDesktop ? 20 : 0, marginBottom: isDesktop ? 24 : 0 }}>
        {!heroBg && <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)` }} />}

        {canEditMsg && (
          <label style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: "#000000aa", border: "1px solid #ffffff33", color: "#fff", borderRadius: 9, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {bgUploading ? "جاري الرفع..." : "🖼️ تغيير الخلفية"}
            <input type="file" accept="image/*" onChange={e => changeBg(e.target.files?.[0])} style={{ display: "none" }} />
          </label>
        )}
        {canEditMsg && heroBg && (
          <button onClick={() => setHeroBg("")} style={{ position: "absolute", top: 12, right: 130, zIndex: 2, background: "#000000aa", border: "1px solid #ffffff33", color: "#fff", borderRadius: 9, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>إزالة</button>
        )}

        <div style={{ display: "flex", gap: 24, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ opacity: visible ? 1 : 0, transition: "all 0.6s ease" }}><Logo size={isDesktop ? 64 : 54} /></div>
              <div>
                <div style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 900, color: COLORS.textPrimary }}>{BRAND_NAME}</div>
                <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, marginTop: 2 }}>{BRAND_TAGLINE}</div>
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

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => onNav("subscriptions")} style={{ padding: "12px 20px", background: `${COLORS.accent}18`, border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💳 الاشتراكات</button>
          <button onClick={() => onNav("memberships")} style={{ padding: "12px 20px", background: `${COLORS.accentGold}18`, border: `1px solid ${COLORS.accentGold}44`, color: COLORS.accentGold, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💎 العضويات</button>
        </div>
      </div>
    </div>
  );
}
