import { useState, useCallback, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { getSession, signOut } from "./lib/auth";
import { COLORS } from "./constants/colors";
import { ROLE_TABS, ALL_TABS, memberships as DEFAULT_MEMBERSHIPS } from "./constants/data";
import { useWindowSize } from "./hooks/useWindowSize";
import { Avatar } from "./components/ui";
import { MoreMenu } from "./components/MoreMenu";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { SchedulePage } from "./pages/SchedulePage";
import { TournamentsPage } from "./pages/TournamentsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StorePage } from "./pages/StorePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { AdminPage } from "./pages/AdminPage";

// أعمدة صريحة بدل select('*') — لا تشمل password أبدًا (كلمة السر يديرها
// Supabase Auth حصريًا). البيانات الطبية تُجلب من جدول medical_records
// المنفصل وتُدمج أدناه.
const USERS_COLUMNS = "id,auth_uid,role,custom_role,name,phone,membership,status,position,points,attendance,child_id,coach_id,permissions,ratings,attendance_log";

export default function App() {
  const [currentUser, setCurrentUser]     = useState(null);
  const [active, setActive]               = useState("home");
  const [users, setUsers]                 = useState([]);
  const [schedule, setSchedule]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tournaments, setTournaments]     = useState({ teams: [], scorers: [] });
  const [library, setLibrary]             = useState([]);
  const [products, setProducts]           = useState([]);
  const [directorMsg, setDirectorMsg]     = useState("نؤمن بأن كل موهبة تستحق الرعاية والتطوير.");
  const [membershipPlans, setMembershipPlans] = useState(DEFAULT_MEMBERSHIPS);
  const [loading, setLoading]             = useState(true);
  const { isDesktop }                     = useWindowSize();

  // ── تحميل البيانات من Supabase ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: usersData },
        { data: medicalData },
        { data: scheduleData },
        { data: notifsData },
        { data: teamsData },
        { data: scorersData },
        { data: libraryData },
        { data: productsData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('users').select(USERS_COLUMNS),
        supabase.from('medical_records').select('*'),
        supabase.from('schedule').select('*').order('order'),
        supabase.from('notifications').select('*').order('id', { ascending: false }),
        supabase.from('tournament_teams').select('*'),
        supabase.from('tournament_scorers').select('*'),
        supabase.from('library').select('*').order('id', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('settings').select('*'),
      ]);

      if (usersData) setUsers(usersData.map(u => {
        const medical = medicalData?.find(m => m.user_id === u.id);
        return {
          ...u,
          customRole: u.custom_role,
          childId: u.child_id,
          coachId: u.coach_id,
          attendanceLog: u.attendance_log || [],
          medical: medical
            ? { health: medical.health, injuries: medical.injuries, allergies: medical.allergies, medications: medical.medications }
            : { health: "جيدة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
        };
      }));
      if (scheduleData) setSchedule(scheduleData);
      if (notifsData) setNotifications(notifsData.map(n => ({ ...n, roles: n.roles || [] })));
      if (teamsData && scorersData) setTournaments({ teams: teamsData, scorers: scorersData });
      if (libraryData) setLibrary(libraryData.map(i => ({ ...i, addedBy: i.added_by })));
      if (productsData) setProducts(productsData.map(p => ({ ...p, images: p.images || [] })));
      if (settingsData) {
        const msg = settingsData.find(s => s.key === 'director_message');
        if (msg) setDirectorMsg(msg.value);
        const plans = settingsData.find(s => s.key === 'memberships');
        if (plans) {
          try { setMembershipPlans(JSON.parse(plans.value)); } catch { /* يبقى الافتراضي */ }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── استعادة الجلسة تلقائيًا بعد تحديث الصفحة ──
  useEffect(() => {
    if (loading || currentUser) return;
    (async () => {
      const session = await getSession();
      if (!session) return;
      const match = users.find(u => u.auth_uid === session.user.id);
      if (match) setCurrentUser(match);
    })();
  }, [loading, users, currentUser]);

  // ── حفظ رسالة المدير ──
  const saveDirectorMsg = async (msg) => {
    setDirectorMsg(msg);
    await supabase.from('settings').upsert({ key: 'director_message', value: msg });
  };

  // ── حفظ باقات العضوية ──
  const saveMembershipPlans = async (plans) => {
    setMembershipPlans(plans);
    await supabase.from('settings').upsert({ key: 'memberships', value: JSON.stringify(plans) });
  };

  const liveUser = currentUser ? users.find(u => u.id === currentUser.id) || currentUser : null;

  const handleLogin  = (user) => { setCurrentUser(user); setActive("home"); };
  const handleLogout = async () => { await signOut(); setCurrentUser(null); setActive("home"); };
  const allowedIds = ROLE_TABS[liveUser?.role] || [];
  const myTabs = ALL_TABS.filter(t => allowedIds.includes(t.id));
  const bottomTabs = myTabs.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.read && n.roles?.includes(liveUser?.role)).length;

  const renderPage = () => {
    switch (active) {
      case "home":          return <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} membershipPlans={membershipPlans} />;
      case "schedule":      return <SchedulePage user={liveUser} schedule={schedule} setSchedule={setSchedule} users={users} setUsers={setUsers} />;
      case "tournaments":   return <TournamentsPage user={liveUser} tournaments={tournaments} setTournaments={setTournaments} schedule={schedule} />;
      case "rewards":       return <RewardsPage user={liveUser} users={users} setUsers={setUsers} />;
      case "store":         return <StorePage products={products} setProducts={setProducts} user={liveUser} />;
      case "profile":       return <ProfilePage user={liveUser} users={users} setUsers={setUsers} />;
      case "notifications": return <NotificationsPage user={liveUser} notifications={notifications} setNotifications={setNotifications} />;
      case "subscriptions": return <SubscriptionsPage user={liveUser} setUsers={setUsers} membershipPlans={membershipPlans} />;
      case "library":       return <LibraryPage user={liveUser} library={library} setLibrary={setLibrary} />;
      case "admin":         return liveUser.role === "مدير" ? <AdminPage user={liveUser} users={users} setUsers={setUsers} products={products} setProducts={setProducts} loadData={loadData} membershipPlans={membershipPlans} saveMembershipPlans={saveMembershipPlans} /> : <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} membershipPlans={membershipPlans} />;
      default:              return <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} membershipPlans={membershipPlans} />;
    }
  };
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#00c896,#0066cc)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "spin 1s linear infinite" }}>⚽</div>
      <div style={{ color: "#00c896", fontSize: 16, fontWeight: 700 }}>جاري التحميل...</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!liveUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.darkBg, fontFamily: "'Cairo',sans-serif", direction: "rtl", color: COLORS.textPrimary, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── Sidebar (Desktop + Mac) ── */}
        {isDesktop && (
          <div style={{ width: 255, background: COLORS.cardBg, borderLeft: `1px solid ${COLORS.border}`, position: "fixed", top: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto" }}>

            {/* الشعار */}
            <div style={{ padding: "22px 18px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#00c896,#0066cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚽</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>أكاديمية النجوم</div>
                  <div style={{ fontSize: 9, color: COLORS.accent, letterSpacing: 1 }}>ACADEMY OF STARS</div>
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

            {/* تسجيل الخروج */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${COLORS.border}` }}>
              <button onClick={handleLogout} style={{ width: "100%", padding: "11px", borderRadius: 11, background: COLORS.danger + "18", border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🚪 تسجيل الخروج
              </button>
            </div>
          </div>
        )}

        {/* ── المحتوى الرئيسي ── */}
        <div style={{ flex: 1, marginRight: isDesktop ? 255 : 0, paddingBottom: isDesktop ? 0 : 80, minHeight: "100vh" }}>

          {/* Header - Mobile فقط */}
          {!isDesktop && (
            <div style={{ background: COLORS.cardBg, borderBottom: `1px solid ${COLORS.border}`, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#00c896,#0066cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚽</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary }}>أكاديمية النجوم</div>
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
    </div>
  );
}
