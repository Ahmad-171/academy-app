import { useState, useEffect } from "react";
import { uploadMedia } from "../lib/media";
import { COLORS } from "../constants/colors";
import { isManager } from "../constants/data";
import { BRAND } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { StatCard, Avatar, Badge, Modal } from "../components/ui";
import { Logo } from "../components/Logo";

const NOTIF_ICONS  = { match: "⚽", absence: "❌", payment: "💳", award: "⭐", training: "🏃", general: "📢" };
const NOTIF_COLORS = (C) => ({ match: C.warning, absence: C.danger, payment: C.accentBlue, award: C.accentGold, training: C.accent, general: C.purple });

export function HomePage({ onNav, user, users, notifications = [], directorMsg, setDirectorMsg, heroBg, setHeroBg, logoUrl, setLogo, saveBrand, plans = [], memberships = [], branchInfo, saveBranchInfo }) {
  const [visible, setVisible] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [tempMsg, setTempMsg] = useState(directorMsg);
  const [bgUploading, setBgUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [brandModal, setBrandModal] = useState(false);
  const [brandDraft, setBrandDraft] = useState(null);
  const [branchModal, setBranchModal] = useState(false);
  const [branchDraft, setBranchDraft] = useState(branchInfo || {});
  const { isDesktop } = useWindowSize();
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const players = users.filter(u => u.role === "لاعب" && !u.hidden);
  const coaches = users.filter(u => u.role === "مدرب" && !u.hidden);
  const canEditMsg = isManager(user);
  const isBoss = isManager(user);
  // تغيير الشعار والخلفية لحساب المبرمج فقط (ليس المدير)
  const canEditBranding = user.role === "مبرمج";

  // اشتراك المستخدم وعضويته لعرضهما في الصفحة الرئيسية (للاعب/ولي الأمر)
  const isSubscriber = user.role === "لاعب" || user.role === "ولي أمر";
  const subActive = user.subscription_end && new Date(user.subscription_end) >= new Date(new Date().toISOString().slice(0, 10));
  const subMonths = (user.subscription_start && user.subscription_end)
    ? Math.max(1, Math.round((new Date(user.subscription_end) - new Date(user.subscription_start)) / (1000 * 60 * 60 * 24 * 30.4)))
    : 0;
  const myPlan = plans.find(p => p.months === subMonths);
  const myMembership = memberships.find(m => m.name === user.membership);
  // ألوان القسم السفلي الأبيض
  const LT = { bg: "#ffffff", card: "#f5f7fa", border: "#e2e8f0", text: "#0f1b2d", sub: "#5a6472" };

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

  // فتح محرّر هوية الموقع (الاسم/الشعار النصي/بطاقات شاشة الدخول) — للمبرمج
  const openBrandEditor = () => {
    setBrandDraft({
      name: BRAND.name,
      tagline: BRAND.tagline,
      features: BRAND.features.map(f => [...f]),
    });
    setBrandModal(true);
  };
  const setFeat = (i, j, v) => setBrandDraft(d => {
    const features = d.features.map(f => [...f]);
    features[i][j] = v;
    return { ...d, features };
  });
  const submitBrand = async () => {
    await saveBrand?.({
      name: brandDraft.name.trim() || BRAND.name,
      tagline: brandDraft.tagline,
      features: brandDraft.features,
    });
    setBrandModal(false);
  };

  const openBranchEditor = () => { setBranchDraft(branchInfo || {}); setBranchModal(true); };
  const submitBranch = async () => { await saveBranchInfo?.(branchDraft); setBranchModal(false); };

  return (
    <div style={{ padding: isDesktop ? "32px" : "0 0 40px" }}>
      {/* Hero */}
      <div style={{ background: heroBg ? `linear-gradient(160deg,#0a1628cc 0%,#0d2044aa 50%,#0a1628cc 100%), url(${heroBg}) center/cover no-repeat` : "linear-gradient(160deg,#0a1628 0%,#0d2044 50%,#0a1628 100%)", padding: isDesktop ? "40px 48px" : "32px 18px 26px", position: "relative", overflow: "hidden", borderBottom: `1px solid ${COLORS.border}`, borderRadius: isDesktop ? 20 : 0, marginBottom: isDesktop ? 24 : 0 }}>
        {!heroBg && <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: `repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)` }} />}

        {canEditBranding && (
          <label style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: "#000000aa", border: "1px solid #ffffff33", color: "#fff", borderRadius: 9, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {bgUploading ? "جاري الرفع..." : "🖼️ تغيير الخلفية"}
            <input type="file" accept="image/*" onChange={e => changeBg(e.target.files?.[0])} style={{ display: "none" }} />
          </label>
        )}
        {canEditBranding && heroBg && (
          <button onClick={() => setHeroBg("")} style={{ position: "absolute", top: 12, right: 130, zIndex: 2, background: "#000000aa", border: "1px solid #ffffff33", color: "#fff", borderRadius: 9, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>إزالة</button>
        )}

        <div style={{ display: "flex", gap: 24, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ opacity: visible ? 1 : 0, transition: "all 0.6s ease", position: "relative" }}>
                <Logo size={isDesktop ? 64 : 54} src={logoUrl} />
                {canEditBranding && (
                  <label title="تغيير الشعار" style={{ position: "absolute", bottom: -6, left: -6, width: 24, height: 24, borderRadius: "50%", background: COLORS.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", border: "2px solid #0a1628" }}>
                    {logoUploading ? "…" : "✎"}
                    <input type="file" accept="image/*" onChange={e => changeLogo(e.target.files?.[0])} style={{ display: "none" }} />
                  </label>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 900, color: COLORS.textPrimary }}>{BRAND.name}</div>
                  {canEditBranding && (
                    <button onClick={openBrandEditor} title="تعديل هوية الموقع" style={{ background: "#ffffff14", border: "1px solid #ffffff26", color: "#fff", borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✎ الاسم والبطاقات</button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, marginTop: 2 }}>{BRAND.tagline}</div>
              </div>
            </div>
            {/* بطاقة المستخدم */}
            <div style={{ background: "#ffffff0a", border: "1px solid #ffffff10", borderRadius: 16, padding: "14px 18px", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={user.name[0]} size={44} color={user.role === "مدير" ? COLORS.purple : user.role === "مدرب" ? COLORS.accentGold : user.role === "ولي أمر" ? COLORS.accentBlue : COLORS.accent} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>{user.name}</div>
                {user.membership_no != null && <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginTop: 1 }}>🎫 رقم العضوية: {user.membership_no}</div>}
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

      {/* القسم السفلي — خلفية بيضاء */}
      <div style={{ background: LT.bg, borderRadius: isDesktop ? 20 : 0, padding: isDesktop ? "24px" : "20px 16px 24px", marginTop: isDesktop ? 20 : 0 }}>

        {/* معلومات الأكاديمية الأساسية (المكان/الأيام/الوقت) */}
        <div style={{ background: LT.card, border: `1px solid ${LT.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 18, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: LT.text }}>📍 معلومات الأكاديمية</div>
            {isBoss && <button onClick={openBranchEditor} style={{ background: "#0f1b2d", border: "none", color: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>}
          </div>
          {[["🏫", "المكان", branchInfo?.place], ["🗓️", "الأيام", branchInfo?.days], ["⏰", "الوقت", branchInfo?.time]].map(([ic, lbl, val], i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 9 : 0 }}>
              <span style={{ fontSize: 16 }}>{ic}</span>
              <div>
                <div style={{ fontSize: 11, color: LT.sub, fontWeight: 600 }}>{lbl}</div>
                <div style={{ fontSize: 13, color: LT.text, fontWeight: 700 }}>{val || "—"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* اشتراكي وعضويتي — للاعب/ولي الأمر */}
        {isSubscriber && (
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 18 }}>
            <div style={{ background: LT.card, border: `1px solid ${subActive ? "#00c89655" : LT.border}`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: LT.sub, fontWeight: 700, marginBottom: 6 }}>💳 اشتراكي</div>
              {subActive ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#00996f" }}>نشط ✅</div>
                  {myPlan?.desc && <div style={{ fontSize: 12, color: LT.text, marginTop: 3 }}>{myPlan.label} — {myPlan.desc}</div>}
                  <div style={{ fontSize: 12, color: LT.sub, marginTop: 4 }}>ساري حتى: {user.subscription_end}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 900, color: LT.sub }}>غير مفعّل</div>
                  <button onClick={() => onNav("subscriptions")} style={{ marginTop: 8, background: "#00c896", border: "none", color: "#000", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>اشترك الآن</button>
                </>
              )}
            </div>
            <div style={{ background: LT.card, border: `1px solid ${LT.border}`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: LT.sub, fontWeight: 700, marginBottom: 6 }}>💎 عضويتي</div>
              {user.membership && user.membership !== "-" ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 900, color: LT.text }}>عضوية {user.membership}</div>
                  {myMembership?.desc && <div style={{ fontSize: 12, color: LT.sub, marginTop: 3 }}>{myMembership.desc}</div>}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 900, color: LT.sub }}>لا توجد عضوية</div>
                  <button onClick={() => onNav("memberships")} style={{ marginTop: 8, background: "#f5c842", border: "none", color: "#000", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>اختر عضوية</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* إحصائيات — للمدير فقط */}
        {isBoss && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 22 }}>
            <StatCard label="لاعب مسجل" value={String(players.length)} icon="⚽" color={COLORS.accent} sub={`${players.filter(p => p.status !== "موقوف").length} نشط`} />
            <StatCard label="مدرب" value={String(coaches.length)} icon="🏅" color={COLORS.accentGold} sub="في الأكاديمية" />
          </div>
        )}

        {/* خانة الأخبار — من الفعاليات والرسائل */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: LT.text }}>📢 آخر الأخبار</div>
          <button onClick={() => onNav("notifications")} style={{ background: "none", border: "none", color: "#00996f", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>عرض الكل ←</button>
        </div>
        {homeNews.length === 0 ? (
          <div style={{ background: LT.card, border: `1px solid ${LT.border}`, borderRadius: 14, padding: "26px 20px", textAlign: "center", color: LT.sub, fontSize: 13, marginBottom: 22 }}>
            لا توجد أخبار منشورة حاليًا
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 12, marginBottom: 22 }}>
            {homeNews.map(n => {
              const c = notifColors[n.type] || COLORS.accent;
              return (
                <div key={n.id} style={{ background: LT.card, border: `1px solid ${c}44`, borderRight: `4px solid ${c}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${c}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || "📢"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: LT.text, lineHeight: 1.6 }}>{n.msg}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: LT.sub }}>{n.time}</span>
                      {n.sender && <span style={{ fontSize: 11, color: c }}>· {n.sender}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => onNav("subscriptions")} style={{ padding: "12px 20px", background: "#00c89618", border: "1px solid #00c89655", color: "#00996f", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💳 الاشتراكات</button>
          <button onClick={() => onNav("memberships")} style={{ padding: "12px 20px", background: "#f5c84222", border: "1px solid #f5c84266", color: "#9a7b00", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💎 العضويات</button>
        </div>
      </div>

      {/* محرّر معلومات الأكاديمية — للمدير */}
      {branchModal && (
        <Modal title="📍 تعديل معلومات الأكاديمية" onClose={() => setBranchModal(false)}>
          {[["place", "المكان", "حي طيبة - مدارس منارات النخبة الأهلية"], ["days", "الأيام", "الأحد - الثلاثاء - الخميس"], ["time", "الوقت", "من ٥م إلى ٧م"]].map(([k, lbl, ph]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 5, fontWeight: 600 }}>{lbl}</div>
              <input value={branchDraft[k] || ""} onChange={e => setBranchDraft(d => ({ ...d, [k]: e.target.value }))} placeholder={ph}
                style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => setBranchModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
            <button onClick={submitBranch} style={{ flex: 2, padding: "11px", borderRadius: 10, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💾 حفظ</button>
          </div>
        </Modal>
      )}

      {/* محرّر هوية الموقع — للمبرمج فقط */}
      {brandModal && brandDraft && (
        <Modal title="🖥️ تعديل هوية الموقع" onClose={() => setBrandModal(false)}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, fontWeight: 600 }}>اسم الأكاديمية</div>
          <input value={brandDraft.name} onChange={e => setBrandDraft(d => ({ ...d, name: e.target.value }))} placeholder="مثال: أكاديمية النجوم"
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box", marginBottom: 14 }} />

          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, fontWeight: 600 }}>الوصف (تحت الاسم)</div>
          <input value={brandDraft.tagline} onChange={e => setBrandDraft(d => ({ ...d, tagline: e.target.value }))} placeholder="مثال: أكاديمية كرة القدم"
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box", marginBottom: 18 }} />

          <div style={{ fontSize: 13, color: COLORS.textPrimary, marginBottom: 4, fontWeight: 800 }}>بطاقات شاشة الدخول</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 12 }}>الأربع بطاقات التي تظهر في صفحة تسجيل الدخول</div>
          {brandDraft.features.map((f, i) => (
            <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={f[0]} onChange={e => setFeat(i, 0, e.target.value)} placeholder="🎯" title="الأيقونة (إيموجي)"
                  style={{ width: 54, textAlign: "center", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 9, padding: "9px 6px", fontSize: 18, boxSizing: "border-box" }} />
                <input value={f[1]} onChange={e => setFeat(i, 1, e.target.value)} placeholder="العنوان"
                  style={{ flex: 1, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 9, padding: "9px 12px", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <input value={f[2]} onChange={e => setFeat(i, 2, e.target.value)} placeholder="الوصف المختصر"
                style={{ width: "100%", marginTop: 8, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 9, padding: "9px 12px", fontSize: 12, boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setBrandModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
            <button onClick={submitBrand} style={{ flex: 2, padding: "11px", borderRadius: 10, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💾 حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
