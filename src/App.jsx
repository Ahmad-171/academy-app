import { useState, useCallback, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { currentUserFromSession, signOut as authSignOut, onAuthChange, changeMyPassword } from "./lib/auth";
import { COLORS, applyTheme, resetTheme, DEFAULT_COLORS } from "./constants/colors";
import { BRAND_NAME, BRAND_TAGLINE } from "./constants/brand";
import { ROLE_TABS, ALL_TABS, SUBSCRIPTION_PLANS, isManager } from "./constants/data";
import { useWindowSize } from "./hooks/useWindowSize";
import { Avatar, Modal } from "./components/ui";
import { Logo } from "./components/Logo";
import { MoreMenu } from "./components/MoreMenu";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { PlayersRegistryPage } from "./pages/PlayersRegistryPage";
import { StorePage } from "./pages/StorePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { MembershipsPage } from "./pages/MembershipsPage";
import { AboutPage } from "./pages/AboutPage";
import { MyChildPage } from "./pages/MyChildPage";
import { MyRecordPage } from "./pages/MyRecordPage";
import { AdminPage } from "./pages/AdminPage";

// الصلاحيات التي تفتح تبويبات لوحة الإدارة لغير المدير
const ADMIN_PERMS = ["editSchedule", "editRatings", "editData", "editCommerce"];

export default function App() {
  const [currentUser, setCurrentUser]     = useState(null);
  const [active, setActive]               = useState("home");
  const [users, setUsers]                 = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [library, setLibrary]             = useState([]);
  const [products, setProducts]           = useState([]);
  const [directorMsg, setDirectorMsg]     = useState("نؤمن بأن كل موهبة تستحق الرعاية والتطوير.");
  const [subscriptionPlans, setSubscriptionPlans] = useState(SUBSCRIPTION_PLANS);
  const [heroBg, setHeroBg]               = useState("");
  // الشعار محفوظ محليًا ليظهر فورًا قبل تسجيل الدخول (شاشة التحميل والدخول)
  const [logoUrl, setLogoUrl]             = useState(() => { try { return localStorage.getItem("nz_logo") || ""; } catch { return ""; } });
  const [loading, setLoading]             = useState(true);
  // تطبيق الألوان المحفوظة محليًا فورًا عند الفتح (قبل تحميل الإعدادات)
  const [themeTick, setThemeTick]         = useState(() => { try { const t = localStorage.getItem("nz_theme"); if (t) applyTheme(JSON.parse(t)); } catch { /* افتراضي */ } return 0; });
  const [pwModal, setPwModal]             = useState(false);
  const [myNewPw, setMyNewPw]             = useState("");
  const [pwMsg, setPwMsg]                 = useState("");
  const { isDesktop }                     = useWindowSize();

  // ── تحميل البيانات من Supabase ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        notifsRes,
        libraryRes,
        productsRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('notifications').select('*').order('id', { ascending: false }),
        supabase.from('library').select('*').order('id', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('settings').select('*'),
      ]);

      // نلقط أي خطأ فعلي من Supabase (RLS، جدول غير موجود، مشروع نائم...) بدل
      // ما نتجاهله بصمت ونخلّي المستخدم يشوف "بيانات خاطئة" بدون سبب حقيقي.
      const firstError = [usersRes, notifsRes, libraryRes, productsRes, settingsRes]
        .map(r => r.error).find(Boolean);
      if (firstError) {
        console.error('Supabase load error:', firstError);
      }

      const { data: usersData } = usersRes;
      const { data: notifsData } = notifsRes;
      const { data: libraryData } = libraryRes;
      const { data: productsData } = productsRes;
      const { data: settingsData } = settingsRes;

      if (usersData) setUsers(usersData.map(u => ({
        ...u,
        customRole: u.custom_role,
        childId: u.child_id,
        coachId: u.coach_id,
        attendanceLog: u.attendance_log || [],
      })));
      if (notifsData) setNotifications(notifsData.map(n => ({ ...n, roles: n.roles || [] })));
      if (libraryData) setLibrary(libraryData.map(i => ({ ...i, addedBy: i.added_by })));
      if (productsData) setProducts(productsData.map(p => ({ ...p, images: p.images || [] })));
      if (settingsData) {
        const msg = settingsData.find(s => s.key === 'director_message');
        if (msg) setDirectorMsg(msg.value);
        const plans = settingsData.find(s => s.key === 'subscription_plans');
        if (plans) {
          try { setSubscriptionPlans(JSON.parse(plans.value)); } catch { /* تبقى الأسعار الافتراضية */ }
        }
        const bg = settingsData.find(s => s.key === 'hero_background');
        if (bg) setHeroBg(bg.value || "");
        const logo = settingsData.find(s => s.key === 'logo_url');
        if (logo) { setLogoUrl(logo.value || ""); try { localStorage.setItem("nz_logo", logo.value || ""); } catch {} }
        const theme = settingsData.find(s => s.key === 'theme_colors');
        if (theme) { try { applyTheme(JSON.parse(theme.value)); setThemeTick(t => t + 1); localStorage.setItem("nz_theme", theme.value); } catch { /* ألوان افتراضية */ } }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }, []);

  // استعادة الجلسة عند فتح الموقع: إن كان هناك تسجيل دخول سابق نحمّل بياناته،
  // وإلا نعرض صفحة الدخول. لا نجلب أي بيانات قبل المصادقة.
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await currentUserFromSession();
      if (!alive) return;
      if (user) { setCurrentUser(user); await loadData(); }
      else setLoading(false);
    })();
    // تنظيف الحالة عند تسجيل الخروج من أي مكان
    const { data: sub } = onAuthChange((session) => {
      if (!session) { setCurrentUser(null); setUsers([]); }
    });
    return () => { alive = false; sub?.subscription?.unsubscribe(); };
  }, [loadData]);

  // ── حفظ رسالة المدير ──
  const saveDirectorMsg = async (msg) => {
    setDirectorMsg(msg);
    await supabase.from('settings').upsert({ key: 'director_message', value: msg });
  };

  // ── حفظ أسعار الاشتراكات ──
  const saveSubscriptionPlans = async (plans) => {
    setSubscriptionPlans(plans);
    await supabase.from('settings').upsert({ key: 'subscription_plans', value: JSON.stringify(plans) });
  };

  // ── حفظ خلفية الصفحة الرئيسية ──
  const saveHeroBg = async (url) => {
    setHeroBg(url);
    await supabase.from('settings').upsert({ key: 'hero_background', value: url });
  };

  // ── حفظ شعار الأكاديمية ──
  const saveLogo = async (url) => {
    setLogoUrl(url);
    try { localStorage.setItem("nz_logo", url || ""); } catch {}
    await supabase.from('settings').upsert({ key: 'logo_url', value: url });
  };

  // ── حفظ ألوان الموقع (من حساب المبرمج) ──
  const saveTheme = async (colors) => {
    applyTheme(colors);
    setThemeTick(t => t + 1);
    try { localStorage.setItem("nz_theme", JSON.stringify(colors)); } catch {}
    await supabase.from('settings').upsert({ key: 'theme_colors', value: JSON.stringify(colors) });
  };
  const resetThemeAll = async () => {
    resetTheme();
    setThemeTick(t => t + 1);
    try { localStorage.setItem("nz_theme", JSON.stringify(DEFAULT_COLORS)); } catch {}
    await supabase.from('settings').upsert({ key: 'theme_colors', value: JSON.stringify(DEFAULT_COLORS) });
  };

  const liveUser = currentUser ? users.find(u => u.id === currentUser.id) || currentUser : null;

  const handleLogin  = (user) => { setCurrentUser(user); setActive("home"); loadData(); };
  const handleLogout = async () => { await authSignOut(); setCurrentUser(null); setUsers([]); setActive("home"); };
  const changeMyPw = async () => {
    if (myNewPw.trim().length < 6) { setPwMsg("كلمة السر يجب أن تكون 6 خانات على الأقل"); return; }
    const { error } = await changeMyPassword(myNewPw.trim());
    if (error) { setPwMsg(error); return; }
    setPwMsg(""); setMyNewPw(""); setPwModal(false);
  };
  // من يحمل صلاحية إدارية يشوف تبويب الإدارة حتى لو ما كان مديرًا
  const hasAdminAccess = isManager(liveUser) || ADMIN_PERMS.some(k => liveUser?.permissions?.[k]);
  const allowedIds = [...(ROLE_TABS[liveUser?.role] || [])];
  if (hasAdminAccess && !allowedIds.includes("admin")) allowedIds.push("admin");
  const myTabs = ALL_TABS.filter(t => allowedIds.includes(t.id));
  const bottomTabs = myTabs.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.read && n.roles?.includes(liveUser?.role)).length;

  const renderPage = () => {
    switch (active) {
      case "home":          return <HomePage onNav={setActive} user={liveUser} users={users} notifications={notifications} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} heroBg={heroBg} setHeroBg={saveHeroBg} logoUrl={logoUrl} setLogo={saveLogo} />;
      case "players":       return <PlayersRegistryPage user={liveUser} users={users} setUsers={setUsers} loadData={loadData} />;
      case "store":         return <StorePage products={products} setProducts={setProducts} user={liveUser} />;
      case "notifications": return <NotificationsPage user={liveUser} notifications={notifications} setNotifications={setNotifications} />;
      case "subscriptions": return <SubscriptionsPage user={liveUser} setUsers={setUsers} plans={subscriptionPlans} />;
      case "memberships":   return <MembershipsPage user={liveUser} />;
      case "about":         return <AboutPage user={liveUser} setUsers={setUsers} />;
      case "mychild":       return <MyChildPage user={liveUser} users={users} />;
      case "myrecord":      return <MyRecordPage user={liveUser} />;
      case "library":       return <LibraryPage user={liveUser} library={library} setLibrary={setLibrary} />;
      case "admin":         return hasAdminAccess ? <AdminPage user={liveUser} users={users} setUsers={setUsers} products={products} setProducts={setProducts} loadData={loadData} subscriptionPlans={subscriptionPlans} saveSubscriptionPlans={saveSubscriptionPlans} saveTheme={saveTheme} resetThemeAll={resetThemeAll} /> : <HomePage onNav={setActive} user={liveUser} users={users} notifications={notifications} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} heroBg={heroBg} setHeroBg={saveHeroBg} logoUrl={logoUrl} setLogo={saveLogo} />;
      default:              return <HomePage onNav={setActive} user={liveUser} users={users} notifications={notifications} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} heroBg={heroBg} setHeroBg={saveHeroBg} logoUrl={logoUrl} setLogo={saveLogo} />;
    }
  };
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ animation: "spin 1s linear infinite" }}><Logo size={60} src={logoUrl} /></div>
      <div style={{ color: "#00c896", fontSize: 16, fontWeight: 700 }}>جاري التحميل...</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!liveUser) return <LoginPage onLogin={handleLogin} logoUrl={logoUrl} />;

  // بوابة العقد: المشترك (لاعب/ولي أمر) لا يستخدم حسابه إلا بعد توقيع العقد
  const needsContract = (liveUser.role === "لاعب" || liveUser.role === "ولي أمر") && !liveUser.contract_signed;
  if (needsContract) return (
    <div data-theme-tick={themeTick} style={{ minHeight: "100vh", background: COLORS.darkBg, fontFamily: "'Cairo',sans-serif", direction: "rtl", color: COLORS.textPrimary }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ background: COLORS.cardBg, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Logo size={34} src={logoUrl} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{BRAND_NAME}</div>
            <div style={{ fontSize: 10, color: COLORS.accent }}>{liveUser.name}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>خروج</button>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ background: COLORS.warning + "15", border: `1px solid ${COLORS.warning}44`, borderRadius: 12, padding: "14px 18px", margin: "18px 16px 0", fontSize: 13, color: COLORS.warning, lineHeight: 1.7 }}>
          👋 مرحبًا بك! لتفعيل حسابك واستخدام الموقع، يجب الاطلاع على الشروط وتوقيع العقد أولاً.
        </div>
        <AboutPage user={liveUser} setUsers={setUsers} />
      </div>
    </div>
  );

  return (
    <div data-theme-tick={themeTick} style={{ minHeight: "100vh", background: COLORS.darkBg, fontFamily: "'Cairo',sans-serif", direction: "rtl", color: COLORS.textPrimary, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── Sidebar (Desktop + Mac) ── */}
        {isDesktop && (
          <div style={{ width: 255, background: COLORS.cardBg, borderLeft: `1px solid ${COLORS.border}`, position: "fixed", top: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto" }}>

            {/* الشعار */}
            <div style={{ padding: "22px 18px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Logo size={40} src={logoUrl} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{BRAND_NAME}</div>
                  <div style={{ fontSize: 9, color: COLORS.accent, letterSpacing: 1 }}>{BRAND_TAGLINE}</div>
                </div>
              </div>

              {/* بطاقة المستخدم */}
              <div style={{ background: COLORS.surface, borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar letter={liveUser.name[0]} size={36} color={liveUser.role === "مدير" ? COLORS.purple : liveUser.role === "مدرب" ? COLORS.accentGold : liveUser.role === "ولي أمر" ? COLORS.accentBlue : COLORS.accent} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{liveUser.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.textSecondary }}>{liveUser.customRole || liveUser.role}</div>
                  {liveUser.membership !== "-" && <div style={{ fontSize: 9, color: COLORS.accentGold, marginTop: 1 }}>عضوية {liveUser.membership}</div>}
                </div>
              </div>
            </div>

            {/* التبويبات */}
            <div style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
              {myTabs.map(t => (
                <button key={t.id} onClick={() => setActive(t.id)} style={{
                  width: "100%", padding: "11px 18px",
                  background: active === t.id ? `${COLORS.accent}18` : "none",
                  border: "none",
                  borderRight: `3px solid ${active === t.id ? COLORS.accent : "transparent"}`,
                  color: active === t.id ? COLORS.accent : COLORS.textSecondary,
                  display: "flex", alignItems: "center", gap: 12,
                  fontWeight: active === t.id ? 800 : 400,
                  fontSize: 13, cursor: "pointer",
                  transition: "all 0.15s",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span>{t.label}</span>
                  {t.id === "notifications" && unreadCount > 0 && (
                    <div style={{ position: "absolute", left: 14, width: 18, height: 18, borderRadius: "50%", background: COLORS.danger, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{unreadCount}</div>
                  )}
                </button>
              ))}
            </div>

            {/* كلمة السر + تسجيل الخروج */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setPwModal(true); setMyNewPw(""); setPwMsg(""); }} style={{ width: "100%", padding: "10px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                🔒 تغيير كلمة السر
              </button>
              <button onClick={handleLogout} style={{ width: "100%", padding: "11px", borderRadius: 11, background: COLORS.danger + "18", border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🚪 تسجيل الخروج
              </button>
            </div>
          </div>
        )}

        {/* ── المحتوى الرئيسي ── */}
        <div style={{ flex: 1, minWidth: 0, marginRight: isDesktop ? 255 : 0, paddingBottom: isDesktop ? 0 : 80, minHeight: "100vh" }}>

          {/* Header - Mobile فقط */}
          {!isDesktop && (
            <div style={{ background: COLORS.cardBg, borderBottom: `1px solid ${COLORS.border}`, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Logo size={32} src={logoUrl} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary }}>{BRAND_NAME}</div>
                  <div style={{ fontSize: 9, color: COLORS.accent }}>{liveUser.customRole || liveUser.role}: {liveUser.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setActive("notifications")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, position: "relative" }}>
                  🔔
                  {unreadCount > 0 && (
                    <div style={{ position: "absolute", top: -2, right: -2, width: 15, height: 15, borderRadius: "50%", background: COLORS.danger, fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{unreadCount}</div>
                  )}
                </button>
                <button onClick={() => { setPwModal(true); setMyNewPw(""); setPwMsg(""); }} title="تغيير كلمة السر" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🔒</button>
                <button onClick={handleLogout} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>خروج</button>
              </div>
            </div>
          )}

          {/* الصفحات */}
          <div style={{ maxWidth: isDesktop ? 1200 : "100%", margin: "0 auto", overflowX: "hidden" }}>
            {renderPage()}
          </div>
        </div>
      </div>

{/* ── Bottom Nav (Mobile فقط) ── */}
      {!isDesktop && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.cardBg, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 50, backdropFilter: "blur(10px)" }}>
          {bottomTabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{ flex: 1, padding: "9px 4px 10px", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", position: "relative" }}>
              <span style={{ fontSize: 21 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: active === t.id ? COLORS.accent : COLORS.textSecondary }}>{t.label}</span>
              {active === t.id && <div style={{ position: "absolute", bottom: 0, width: 28, height: 2, background: COLORS.accent, borderRadius: "2px 2px 0 0" }} />}
              {t.id === "notifications" && unreadCount > 0 && (
                <div style={{ position: "absolute", top: 4, right: "calc(50% - 14px)", width: 14, height: 14, borderRadius: "50%", background: COLORS.danger, fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{unreadCount}</div>
              )}
            </button>
          ))}
          {/* زر المزيد */}
          {myTabs.length > 5 && (
            <MoreMenu myTabs={myTabs} active={active} setActive={setActive} />
          )}
        </div>
        )}

      {/* تغيير كلمة السر الخاصة بي */}
      {pwModal && (
        <Modal title="🔒 تغيير كلمة السر" onClose={() => { setPwModal(false); setMyNewPw(""); setPwMsg(""); }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>اكتب كلمة سر جديدة لحسابك.</div>
          <input type="password" value={myNewPw} onChange={e => setMyNewPw(e.target.value)} placeholder="6 خانات على الأقل"
            onKeyDown={e => e.key === "Enter" && changeMyPw()}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />
          {pwMsg && <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}33`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: COLORS.danger, marginBottom: 12 }}>⚠️ {pwMsg}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setPwModal(false); setMyNewPw(""); setPwMsg(""); }} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={changeMyPw} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
