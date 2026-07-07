import { useState, useEffect } from "react";
import { uploadMedia } from "../lib/media";
import { COLORS } from "../constants/colors";
import { isManager } from "../constants/data";
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { StatCard, Avatar, Badge } from "../components/ui";
import { Logo } from "../components/Logo";

const NOTIF_ICONS  = { match: "⚽", absence: "❌", payment: "💳", award: "⭐", training: "🏃", general: "📢" };
const NOTIF_COLORS = (C) => ({ match: C.warning, absence: C.danger, payment: C.accentBlue, award: C.accentGold, training: C.accent, general: C.purple });

export function HomePage({ onNav, user, users, notifications = [], directorMsg, setDirectorMsg, heroBg, setHeroBg, logoUrl, setLogo }) {
  const [visible, setVisible] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [tempMsg, setTempMsg] = useState(directorMsg);
  const [bgUploading, setBgUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const { isDesktop } = useWindowSize();
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const players = users.filter(u => u.role === "لاعب");
  const coaches = users.filter(u => u.role === "مدرب");
  const canEditMsg = isManager(user);

  // أخبار الصفحة الرئيسية: الفعاليات/الرسائل المعلّمة للظهور هنا والمستهدِفة لدور المستخدم
  const notifColors = NOTIF_COLORS(COLORS);
  const homeNews = notifications
    .filter(n => n.show_on_home && (n.roles?.includes(user.role) ?? true))
    .slice(0, 6);

  const changeBg = async (file) => {
    if (!file) return;
    setBgUploading(true);
    const { url, error } = await uploadMedia(file, "hero");
    if (!error && url) await setHeroBg(url);
    setBgUploading(false);
  };

  const changeLogo = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    const { url, error } = await uploadMedia(file, "logo");
    if (!error && url) await setLogo(url);
    setLogoUploading(false);
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
              <div style={{ opacity: visible ? 1 : 0, transition: "all 0.6s ease", position: "relative" }}>
                <Logo size={isDesktop ? 64 : 54} src={logoUrl} />
                {canEditMsg && (
                  <label title="تغيير الشعار" style={{ position: "absolute", bottom: -6, left: -6, width: 24, height: 24, borderRadius: "50%", background: COLORS.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", border: "2px solid #0a1628" }}>
                    {logoUploading ? "…" : "✎"}
                    <input type="file" accept="image/*" onChange={e => changeLogo(e.target.files?.[0])} style={{ display: "none" }} />
                  </label>
                )}
              </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 22 }}>
          <StatCard label="لاعب مسجل" value={String(players.length)} icon="⚽" color={COLORS.accent} sub={`${players.filter(p => p.status !== "موقوف").length} نشط`} />
          <StatCard label="مدرب" value={String(coaches.length)} icon="🏅" color={COLORS.accentGold} sub="في الأكاديمية" />
        </div>

        {/* خانة الأخبار — من الفعاليات والرسائل */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>📢 آخر الأخبار</div>
          <button onClick={() => onNav("notifications")} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>عرض الكل ←</button>
        </div>
        {homeNews.length === 0 ? (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "26px 20px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13, marginBottom: 22 }}>
            لا توجد أخبار منشورة حاليًا
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 12, marginBottom: 22 }}>
            {homeNews.map(n => {
              const c = notifColors[n.type] || COLORS.accent;
              return (
                <div key={n.id} style={{ background: COLORS.cardBg, border: `1px solid ${c}33`, borderRight: `4px solid ${c}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${c}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || "📢"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{n.msg}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{n.time}</span>
                      {n.sender && <span style={{ fontSize: 11, color: c }}>· {n.sender}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => onNav("subscriptions")} style={{ padding: "12px 20px", background: `${COLORS.accent}18`, border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💳 الاشتراكات</button>
          <button onClick={() => onNav("memberships")} style={{ padding: "12px 20px", background: `${COLORS.accentGold}18`, border: `1px solid ${COLORS.accentGold}44`, color: COLORS.accentGold, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💎 العضويات</button>
        </div>
      </div>
    </div>
  );
}
