import { useState, useEffect, useCallback } from "react";
import { supabase } from './supabase';
/* eslint-disable no-unused-vars */

const COLORS = {
  darkBg: "#0a0e1a", cardBg: "#0f1628", surface: "#151d35",
  border: "#1e2d50", accent: "#00c896", accentGold: "#f5c842",
  accentBlue: "#3b82f6", textPrimary: "#f0f4ff", textSecondary: "#7a8bb5",
  danger: "#ef4444", warning: "#f59e0b", purple: "#a855f7",
};

const INIT_USERS = [
  {
    id: "111", password: "111", role: "مدير", customRole: "مدير",
    name: "المدير", phone: "1111", membership: "-",
    points: 0, attendance: 0, position: "-", status: "نشط",
    childId: null, permissions: {},
  },
  {
    id: "221", password: "221", role: "مدرب", customRole: "مدرب",
    name: "المدرب 1", phone: "2221", membership: "-",
    points: 0, attendance: 96, position: "-", status: "نشط",
    childId: null,
    permissions: { editSchedule: false, editData: false, sendNotifications: false, editRatings: false, editMedical: false, editLibrary: false, editTournaments: false },
  },
  {
    id: "222", password: "222", role: "مدرب", customRole: "مدرب",
    name: "المدرب 2", phone: "2222", membership: "-",
    points: 0, attendance: 92, position: "-", status: "نشط",
    childId: null,
    permissions: { editSchedule: false, editData: false, sendNotifications: false, editRatings: false, editMedical: false, editLibrary: false, editTournaments: false },
  },
  {
    id: "331", password: "331", role: "لاعب", customRole: "لاعب",
    name: "اللاعب 1", phone: "3331", membership: "ذهبي",
    points: 840, attendance: 92, position: "مهاجم", status: "نشط",
    childId: null, coachId: "221",
    permissions: { editData: false },
    medical: { health: "ممتازة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
    ratings: { speed: 85, passing: 72, shooting: 91, defense: 60, spirit: 95 },
    attendanceLog: [true, true, false, true, true, true, false, true, true, true],
  },
  {
    id: "332", password: "332", role: "لاعب", customRole: "لاعب",
    name: "اللاعب 2", phone: "3332", membership: "فضي",
    points: 760, attendance: 88, position: "وسط", status: "نشط",
    childId: null, coachId: "221",
    permissions: { editData: false },
    medical: { health: "جيدة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
    ratings: { speed: 78, passing: 85, shooting: 70, defense: 72, spirit: 88 },
    attendanceLog: [true, true, true, false, true, true, true, false, true, true],
  },
  {
    id: "333", password: "333", role: "لاعب", customRole: "لاعب",
    name: "اللاعب 3", phone: "3333", membership: "ماسي",
    points: 920, attendance: 95, position: "دفاع", status: "نشط",
    childId: null, coachId: "222",
    permissions: { editData: false },
    medical: { health: "ممتازة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
    ratings: { speed: 70, passing: 80, shooting: 65, defense: 92, spirit: 90 },
    attendanceLog: [true, true, true, true, true, false, true, true, true, true],
  },
  {
    id: "334", password: "334", role: "لاعب", customRole: "لاعب",
    name: "اللاعب 4", phone: "3334", membership: "برونزي",
    points: 580, attendance: 80, position: "حارس", status: "نشط",
    childId: null, coachId: "221",
    permissions: { editData: false },
    medical: { health: "جيدة", injuries: "إجهاد عضلي", allergies: "لا يوجد", medications: "مسكن" },
    ratings: { speed: 65, passing: 60, shooting: 55, defense: 88, spirit: 82 },
    attendanceLog: [true, false, true, true, false, true, true, true, false, true],
  },
  {
    id: "441", password: "441", role: "ولي أمر", customRole: "ولي أمر",
    name: "ولي الأمر 1", phone: "4441", membership: "-",
    points: 0, attendance: 0, position: "-", status: "نشط",
    childId: "331", permissions: {},
  },
  {
    id: "442", password: "442", role: "ولي أمر", customRole: "ولي أمر",
    name: "ولي الأمر 2", phone: "4442", membership: "-",
    points: 0, attendance: 0, position: "-", status: "نشط",
    childId: "332", permissions: {},
  },
];

const INIT_SCHEDULE = [
  { id: 1, day: "الأحد",    time: "٤:٠٠ م",  type: "تدريب",  team: "الفريق 1", location: "الملعب الرئيسي", order: 1 },
  { id: 2, day: "الثلاثاء", time: "٥:٠٠ م",  type: "تدريب",  team: "الفريق 1", location: "الملعب الرئيسي", order: 2 },
  { id: 3, day: "الجمعة",   time: "١٠:٠٠ ص", type: "مباراة", team: "الفريق 1 vs النادي 2", location: "ملعب الدوري", order: 3 },
  { id: 4, day: "السبت",    time: "٤:٣٠ م",  type: "تدريب",  team: "الفريق 2", location: "الملعب B", order: 4 },
];

const INIT_NOTIFICATIONS = [
  { id: 1, type: "match",   msg: "مباراة غداً ضد النادي 2 الساعة ١٠ صباحاً", time: "منذ ساعة",    read: false, roles: ["مدير","مدرب","لاعب","ولي أمر"] },
  { id: 2, type: "absence", msg: "تم تسجيل غياب اللاعب 1 في تدريب أمس",      time: "منذ ٣ ساعات", read: false, roles: ["مدير","مدرب","ولي أمر"] },
  { id: 3, type: "payment", msg: "ينتهي اشتراكك خلال ٥ أيام - جدد الآن",     time: "منذ يوم",      read: true,  roles: ["لاعب","ولي أمر"] },
  { id: 4, type: "award",   msg: "حصلت على ١٠٠ نقطة إضافية!",                time: "منذ يومين",   read: true,  roles: ["لاعب"] },
  { id: 5, type: "payment", msg: "تم استلام دفعة جديدة",                       time: "منذ ساعتين",  read: false, roles: ["مدير"] },
];

const INIT_TOURNAMENTS = {
  teams: [
    { id: 1, name: "النادي 1", p: 8, w: 6, d: 1, l: 1, pts: 19 },
    { id: 2, name: "النادي 2", p: 8, w: 5, d: 2, l: 1, pts: 17 },
    { id: 3, name: "النادي 3", p: 8, w: 4, d: 1, l: 3, pts: 13 },
    { id: 4, name: "النادي 4", p: 8, w: 3, d: 2, l: 3, pts: 11 },
    { id: 5, name: "النادي 5", p: 8, w: 2, d: 1, l: 5, pts:  7 },
  ],
  scorers: [
    { id: 1, name: "اللاعب 1", goals: 11, team: "النادي 1" },
    { id: 2, name: "اللاعب أ", goals: 9,  team: "النادي 2" },
    { id: 3, name: "اللاعب ب", goals: 7,  team: "النادي 3" },
    { id: 4, name: "اللاعب 2", goals: 6,  team: "النادي 1" },
  ],
};

const INIT_LIBRARY = [
  { id: 1, type: "image",       category: "تدريب",  title: "تدريب الأحد",       emoji: "🏃", date: "٢٠٢٦/٦/١"  },
  { id: 2, type: "video",       category: "مباراة", title: "مباراة النادي 2",    emoji: "🎬", date: "٢٠٢٦/٥/٢٨" },
  { id: 3, type: "achievement", category: "إنجاز",  title: "بطولة الدوري ٢٠٢٦", emoji: "🏆", date: "٢٠٢٦/٥/١٥" },
  { id: 4, type: "goal",        category: "هدف",    title: "هدف اللاعب 1",       emoji: "⚽", date: "٢٠٢٦/٥/٢٨" },
];

const INIT_DIRECTOR_MSG = "نؤمن بأن كل موهبة تستحق الرعاية والتطوير. مرحباً بكم في أكاديميتنا.";

const memberships = [
  { name: "برونزي", color: "#cd7f32", bg: "linear-gradient(135deg,#3d2b1f,#6b4226)", price: "٢٥٠", features: ["حضور التدريبات","متابعة الحضور","تقارير أساسية"], icon: "🥉" },
  { name: "فضي",    color: "#c0c0c0", bg: "linear-gradient(135deg,#2a2a3a,#4a4a6a)", price: "٤٥٠", features: ["كل مزايا البرونزي","نظام النقاط","المكتبة","تقييمات مفصلة"], icon: "🥈" },
  { name: "ذهبي",   color: "#f5c842", bg: "linear-gradient(135deg,#3d3000,#7a6000)", price: "٦٥٠", features: ["كل مزايا الفضي","السجل الطبي","متجر الأكاديمية","أولوية البطولات"], icon: "🥇", popular: true },
  { name: "ماسي",   color: "#b9f2ff", bg: "linear-gradient(135deg,#002244,#004488)", price: "٩٥٠", features: ["جميع المزايا","استشارات خاصة","خصم ٢٠٪","دعم أولوية"], icon: "💎" },
];

const financialData = [
  { month: "يناير",  revenue: 48000, expenses: 22000 },
  { month: "فبراير", revenue: 52000, expenses: 24000 },
  { month: "مارس",   revenue: 61000, expenses: 25000 },
  { month: "أبريل",  revenue: 58000, expenses: 23000 },
  { month: "مايو",   revenue: 67000, expenses: 26000 },
  { month: "يونيو",  revenue: 72000, expenses: 28000 },
];

const INIT_PRODUCTS = [
  { id: 1, name: "طقم الأكاديمية", price: 280, category: "ملابس",  img: "👕", images: [] },
  { id: 2, name: "شال الأكاديمية", price: 85,  category: "إكسسوار", img: "🧣", images: [] },
  { id: 3, name: "حقيبة رياضة",    price: 150, category: "حقائب",   img: "🎒", images: [] },
  { id: 4, name: "علم الأكاديمية", price: 65,  category: "إكسسوار", img: "🚩", images: [] },
  { id: 5, name: "طقم التدريب",    price: 190, category: "ملابس",   img: "🩳", images: [] },
  { id: 6, name: "كرة رسمية",      price: 120, category: "معدات",   img: "⚽", images: [] },
];

const PERMISSION_LABELS = {
  editSchedule:      "تعديل الجداول والمواعيد",
  editData:          "تعديل البيانات الشخصية",
  sendNotifications: "إرسال الإشعارات",
  editRatings:       "تعديل تقييمات اللاعبين",
  editMedical:       "تعديل السجل الطبي",
  editLibrary:       "إضافة للمكتبة",
  editTournaments:   "تعديل البطولات والهدافين",
};

const ROLE_TABS = {
  "مدير":    ["home","schedule","tournaments","rewards","store","profile","notifications","subscriptions","library","admin"],
  "مدرب":    ["home","schedule","tournaments","profile","notifications","library"],
  "لاعب":    ["home","schedule","tournaments","rewards","store","profile","notifications","subscriptions","library"],
  "ولي أمر": ["home","schedule","tournaments","profile","notifications","library"],
};

function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isDesktop: width >= 900 };
}

// ── مكونات مساعدة ──
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle at top right,${color}22,transparent)` }} />
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</span>;
}

function Avatar({ letter, size = 40, color = COLORS.accent }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${color}44,${color}22)`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>{letter}</div>
  );
}

function MiniBar({ percent, color }) {
  return (
    <div style={{ background: COLORS.border, borderRadius: 4, height: 6, overflow: "hidden", marginTop: 4 }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, width: wide ? "min(95vw,720px)" : "min(92vw,480px)", zIndex: 201, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{title}</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = "text", options, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
      )}
    </div>
  );
}

function ToastMsg({ msg, color }) {
  return (
    <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: color, color: "#000", padding: "10px 28px", borderRadius: 20, fontWeight: 800, fontSize: 13, zIndex: 500, boxShadow: `0 4px 20px ${color}66`, whiteSpace: "nowrap" }}>{msg}</div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, color = COLORS.accent) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, show };
}

// ── تسجيل الدخول ──
function LoginPage({ onLogin, users }) {
  const [idNum, setIdNum] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useWindowSize();

  const handleLogin = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.id === idNum && u.password === pass);
      if (user) {
        if (user.status === "موقوف") setError("هذا الحساب موقوف، تواصل مع الإدارة");
        else onLogin(user);
      } else setError("رقم الهوية أو كلمة السر غير صحيحة");
      setLoading(false);
    }, 700);
  };

  const demos = [
    { label: "مدير",      id: "111", color: COLORS.purple },
    { label: "مدرب 1",    id: "221", color: COLORS.accentGold },
    { label: "مدرب 2",    id: "222", color: COLORS.accentGold },
    { label: "لاعب 1",    id: "331", color: COLORS.accent },
    { label: "لاعب 2",    id: "332", color: COLORS.accent },
    { label: "ولي أمر 1", id: "441", color: COLORS.accentBlue },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.darkBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Cairo',sans-serif", direction: "rtl" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", gap: 48, alignItems: "center", width: "100%", maxWidth: isDesktop ? 920 : 400 }}>

        {isDesktop && (
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ width: 110, height: 110, margin: "0 auto 20px", background: "linear-gradient(135deg,#00c896,#0066cc)", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, boxShadow: "0 0 60px #00c89644" }}>⚽</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.textPrimary, marginBottom: 6 }}>أكاديمية النجوم</div>
            <div style={{ fontSize: 13, color: COLORS.accent, letterSpacing: 3, marginBottom: 28 }}>ACADEMY OF STARS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["⚽", "اللاعبين",  String(users.filter(u => u.role === "لاعب").length)],
                ["🏅", "المدربين",  String(users.filter(u => u.role === "مدرب").length)],
                ["👨‍👦","أولياء الأمور", String(users.filter(u => u.role === "ولي أمر").length)],
                ["👥", "إجمالي الحسابات", String(users.length)],
              ].map(([icon, label, val], i) => (
                <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 26 }}>{icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.accent, marginTop: 4 }}>{val}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ width: isDesktop ? 370 : "100%" }}>
          {!isDesktop && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 76, height: 76, margin: "0 auto 10px", background: "linear-gradient(135deg,#00c896,#0066cc)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 40px #00c89644" }}>⚽</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.textPrimary }}>أكاديمية النجوم</div>
            </div>
          )}

          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 26, marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 3 }}>تسجيل الدخول</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 22 }}>أدخل رقم هويتك وكلمة السر</div>

            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 5, fontWeight: 600 }}>رقم الهوية</div>
              <input value={idNum} onChange={e => setIdNum(e.target.value)} placeholder="أدخل رقم الهوية"
                style={{ width: "100%", background: COLORS.surface, border: `1px solid ${error ? COLORS.danger : COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "11px 14px", fontSize: 14, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 5, fontWeight: 600 }}>كلمة السر</div>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${error ? COLORS.danger : COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "11px 14px", fontSize: 14, boxSizing: "border-box" }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 15 }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {error && (
              <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}33`, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: COLORS.danger, marginBottom: 14 }}>⚠️ {error}</div>
            )}

            <button onClick={handleLogin} disabled={loading || !idNum || !pass}
              style={{ width: "100%", padding: "13px", borderRadius: 13, background: idNum && pass ? `linear-gradient(135deg,${COLORS.accent},#00a07a)` : COLORS.surface, border: "none", color: idNum && pass ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: idNum && pass ? "pointer" : "not-allowed" }}>
              {loading ? "جاري الدخول..." : "دخول ←"}
            </button>
          </div>

          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 10, fontWeight: 700 }}>🔑 حسابات تجريبية — اضغط للملء التلقائي:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {demos.map((acc, i) => (
                <button key={i} onClick={() => { setIdNum(acc.id); setPass(acc.id); setError(""); }}
                  style={{ padding: "8px 10px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 9, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <Badge text={acc.label} color={acc.color} />
                  <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{acc.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── صفحة الرئيسية ──
function HomePage({ onNav, user, users, directorMsg, setDirectorMsg }) {
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
          {memberships.map((m, i) => (
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

// ── صفحة الجداول ──
function SchedulePage({ user, schedule, setSchedule, users, setUsers }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editAttModal, setEditAttModal] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [newItem, setNewItem] = useState({ day: "الأحد", time: "", type: "تدريب", team: "", location: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editSchedule;
  const canEditAtt = user.role === "مدير";

  const players = users.filter(u => u.role === "لاعب");
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const addItem = async () => {
    if (!newItem.time || !newItem.team || !newItem.location) { show("⚠️ أكمل جميع الحقول", COLORS.warning); return; }
    const { data } = await supabase.from('schedule').insert({
      day: newItem.day, time: newItem.time, type: newItem.type,
      team: newItem.team, location: newItem.location, order: schedule.length + 1,
    }).select().single();
    if (data) setSchedule(prev => [...prev, data]);
    setNewItem({ day: "الأحد", time: "", type: "تدريب", team: "", location: "" });
    setAddModal(false);
    show("✅ تم إضافة الموعد");
  };

  const deleteItem = async (id) => {
    await supabase.from('schedule').delete().eq('id', id);
    setSchedule(prev => prev.filter(s => s.id !== id));
    show("🗑️ تم حذف الموعد", COLORS.danger);
  };

  const saveEdit = async () => {
    await supabase.from('products').update({
      name: editModal.name,
      price: Number(editModal.price),
      category: editModal.category,
      img: editModal.img,
    }).eq('id', editModal.id);
    setProducts(prev => prev.map(p => p.id === editModal.id ? { ...editModal, price: Number(editModal.price) } : p));
    setEditModal(null);
    show("✅ تم تحديث المنتج");
  };
  const addImage = async (productId, imageUrl) => {
    const product = products.find(p => p.id === productId);
    const newImages = [...(product.images || []), { id: Date.now(), url: imageUrl }];
    await supabase.from('products').update({ images: newImages }).eq('id', productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, images: newImages } : p));
    show("✅ تم إضافة الصورة");
  };
  const removeImage = async (productId, imageId) => {
    const product = products.find(p => p.id === productId);
    const newImages = (product.images || []).filter(img => img.id !== imageId);
    await supabase.from('products').update({ images: newImages }).eq('id', productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, images: newImages } : p));
    show("🗑️ تم حذف الصورة", COLORS.danger);
  };

  const moveItem = async (id, dir) => {
    const arr = [...schedule].sort((a, b) => a.order - b.order);
    const idx = arr.findIndex(s => s.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === arr.length - 1) return;
    const swap = dir === "up" ? idx - 1 : idx + 1;
    const newArr = [...arr];
    [newArr[idx].order, newArr[swap].order] = [newArr[swap].order, newArr[idx].order];
    setSchedule(newArr);
    await supabase.from('schedule').update({ order: newArr[idx].order }).eq('id', newArr[idx].id);
    await supabase.from('schedule').update({ order: newArr[swap].order }).eq('id', newArr[swap].id);
  };

  const toggleAtt = (playerId, sessionIdx) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== playerId) return u;
      const log = [...(u.attendanceLog || [])];
      log[sessionIdx] = !log[sessionIdx];
      const attPct = log.length ? Math.round((log.filter(Boolean).length / log.length) * 100) : 0;
      return { ...u, attendanceLog: log, attendance: attPct };
    }));
  };

  const sortedSchedule = [...schedule].sort((a, b) => a.order - b.order);

  // ولي الأمر يشوف حضور ابنه فقط
  const myChild = user.role === "ولي أمر" ? users.find(u => u.id === user.childId) : null;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>الجداول والمواعيد</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>إجمالي {schedule.length} موعد</div>
        </div>
        {canEdit && (
          <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ إضافة</button>
        )}
      </div>

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* جدول التمارين */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📅 جدول التمارين والمباريات</div>

          {/* باركود للاعب */}
          {user.role === "لاعب" && (
            <div style={{ background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 16, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>📲 باركود الحضور</div>
              {qrVisible ? (
                <div style={{ width: 110, height: 110, margin: "0 auto", background: "#fff", borderRadius: 10, padding: 6, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                  {Array(49).fill(0).map((_, i) => <div key={i} style={{ background: [0,1,2,6,7,13,14,15,16,20,21,27,28,29,34,35,41,42,43,44,48].includes(i) ? "#000" : "#fff", borderRadius: 1 }} />)}
                </div>
              ) : (
                <button onClick={() => setQrVisible(true)} style={{ background: COLORS.accent, border: "none", color: "#000", padding: "9px 24px", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>عرض الباركود</button>
              )}
            </div>
          )}

          {/* الجدول على شكل جدول */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.surface }}>
                  {["اليوم", "الوقت", "النوع", "الفريق", "الملعب", canEdit ? "إجراء" : ""].filter(Boolean).map((h, i) => (
                    <th key={i} style={{ padding: "11px 10px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSchedule.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: s.type === "مباراة" ? `${COLORS.warning}08` : "transparent" }}>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{s.day}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>{s.time}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <Badge text={s.type === "مباراة" ? "🏆 مباراة" : "🏃 تدريب"} color={s.type === "مباراة" ? COLORS.warning : COLORS.accent} />
                    </td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{s.team}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{s.location}</td>
                    {canEdit && (
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={() => moveItem(s.id, "up")} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>↑</button>
                          <button onClick={() => moveItem(s.id, "down")} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>↓</button>
                          <button onClick={() => setEditModal({ ...s })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                          <button onClick={() => deleteItem(s.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {sortedSchedule.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد مواعيد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* جدول الحضور */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>✅ جدول الحضور والغياب</div>
            {canEditAtt && <button onClick={() => setEditAttModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>تعديل</button>}
          </div>

          {/* ولي الأمر يشوف ابنه فقط */}
          {user.role === "ولي أمر" && myChild ? (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Avatar letter={myChild.name[0]} size={36} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{myChild.name}</div>
                  <Badge text={`${myChild.attendance}٪ حضور`} color={myChild.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(myChild.attendanceLog || []).map((a, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: a ? COLORS.accent + "22" : COLORS.danger + "22", border: `1px solid ${a ? COLORS.accent : COLORS.danger}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a ? "✅" : "❌"}</div>
                ))}
              </div>
            </div>
          ) : (user.role === "مدير" || user.role === "مدرب") ? (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: COLORS.surface }}>
                      <th style={{ padding: "10px 12px", fontSize: 11, color: COLORS.textSecondary, textAlign: "right", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>اللاعب</th>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <th key={n} style={{ padding: "10px 6px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>ج{n}</th>
                      ))}
                      <th style={{ padding: "10px 8px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>٪</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: COLORS.textPrimary, fontWeight: 600, whiteSpace: "nowrap" }}>{p.name}</td>
                        {(p.attendanceLog || Array(10).fill(false)).map((a, j) => (
                          <td key={j} style={{ padding: "6px", textAlign: "center" }}>
                            <button onClick={() => canEditAtt && toggleAtt(p.id, j)} style={{ background: "none", border: "none", cursor: canEditAtt ? "pointer" : "default", fontSize: 14 }}>{a ? "✅" : "❌"}</button>
                          </td>
                        ))}
                        <td style={{ padding: "9px 8px", textAlign: "center" }}>
                          <Badge text={`${p.attendance}٪`} color={p.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "30px", textAlign: "center", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div>جدول الحضور متاح للمدير والمدرب فقط</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal إضافة موعد */}
      {addModal && (
        <Modal title="➕ إضافة موعد" onClose={() => setAddModal(false)}>
          <Field label="اليوم" value={newItem.day} onChange={v => setNewItem(p => ({ ...p, day: v }))} options={days} />
          <Field label="الوقت" value={newItem.time} onChange={v => setNewItem(p => ({ ...p, time: v }))} placeholder="مثال: ٤:٠٠ م" />
          <Field label="النوع" value={newItem.type} onChange={v => setNewItem(p => ({ ...p, type: v }))} options={["تدريب", "مباراة", "بطولة"]} />
          <Field label="الفريق / المباراة" value={newItem.team} onChange={v => setNewItem(p => ({ ...p, team: v }))} placeholder="مثال: الفريق 1 أو الفريق 1 vs النادي 2" />
          <Field label="الملعب / الموقع" value={newItem.location} onChange={v => setNewItem(p => ({ ...p, location: v }))} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addItem} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {/* Modal تعديل موعد */}
      {editModal && (
        <Modal title="✏️ تعديل الموعد" onClose={() => setEditModal(null)}>
          <Field label="اليوم" value={editModal.day} onChange={v => setEditModal(p => ({ ...p, day: v }))} options={days} />
          <Field label="الوقت" value={editModal.time} onChange={v => setEditModal(p => ({ ...p, time: v }))} />
          <Field label="النوع" value={editModal.type} onChange={v => setEditModal(p => ({ ...p, type: v }))} options={["تدريب", "مباراة", "بطولة"]} />
          <Field label="الفريق" value={editModal.team} onChange={v => setEditModal(p => ({ ...p, team: v }))} />
          <Field label="الملعب" value={editModal.location} onChange={v => setEditModal(p => ({ ...p, location: v }))} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveEdit} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const addTeam = async () => {
    if (!newTeam.name) { show("⚠️ أدخل اسم الفريق", COLORS.warning); return; }
    const { data } = await supabase.from('tournament_teams').insert({
      name: newTeam.name,
      p: Number(newTeam.p), w: Number(newTeam.w),
      d: Number(newTeam.d), l: Number(newTeam.l),
      pts: Number(newTeam.pts),
    }).select().single();
    if (data) setTournaments(prev => ({ ...prev, teams: [...prev.teams, data] }));
    setNewTeam({ name: "", p: 0, w: 0, d: 0, l: 0, pts: 0 });
    setAddTeamModal(false);
    show("✅ تم إضافة الفريق");
  };
  const saveTeam = async () => {
    await supabase.from('tournament_teams').update({
      name: editTeamModal.name,
      p: Number(editTeamModal.p), w: Number(editTeamModal.w),
      d: Number(editTeamModal.d), l: Number(editTeamModal.l),
      pts: Number(editTeamModal.pts),
    }).eq('id', editTeamModal.id);
    setTournaments(prev => ({ ...prev, teams: prev.teams.map(t => t.id === editTeamModal.id ? editTeamModal : t) }));
    setEditTeamModal(null);
    show("✅ تم تحديث الفريق");
  };
  const deleteTeam = async (id) => {
    await supabase.from('tournament_teams').delete().eq('id', id);
    setTournaments(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));
    show("🗑️ تم حذف الفريق", COLORS.danger);
  };
  const addScorer = async () => {
    if (!newScorer.name) { show("⚠️ أدخل اسم اللاعب", COLORS.warning); return; }
    const { data } = await supabase.from('tournament_scorers').insert({
      name: newScorer.name,
      goals: Number(newScorer.goals),
      team: newScorer.team,
    }).select().single();
    if (data) setTournaments(prev => ({ ...prev, scorers: [...prev.scorers, data] }));
    setNewScorer({ name: "", goals: 0, team: "" });
    setAddScorerModal(false);
    show("✅ تم إضافة الهداف");
  };
  const saveScorer = async () => {
    await supabase.from('tournament_scorers').update({
      name: editScorerModal.name,
      goals: Number(editScorerModal.goals),
      team: editScorerModal.team,
    }).eq('id', editScorerModal.id);
    setTournaments(prev => ({ ...prev, scorers: prev.scorers.map(s => s.id === editScorerModal.id ? editScorerModal : s) }));
    setEditScorerModal(null);
    show("✅ تم تحديث الهداف");
  };
  const deleteScorer = async (id) => {
    await supabase.from('tournament_scorers').delete().eq('id', id);
    setTournaments(prev => ({ ...prev, scorers: prev.scorers.filter(s => s.id !== id) }));
    show("🗑️ تم حذف الهداف", COLORS.danger);
  };
// ── صفحة البطولات ──
function TournamentsPage({ user, tournaments, setTournaments }) {
  const [editTeamModal, setEditTeamModal] = useState(null);
  const [editScorerModal, setEditScorerModal] = useState(null);
  const [addTeamModal, setAddTeamModal] = useState(false);
  const [addScorerModal, setAddScorerModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", p: 0, w: 0, d: 0, l: 0, pts: 0 });
  const [newScorer, setNewScorer] = useState({ name: "", goals: 0, team: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editTournaments;

  const saveTeam = () => {
    if (editTeamModal.id) {
      setTournaments(prev => ({ ...prev, teams: prev.teams.map(t => t.id === editTeamModal.id ? editTeamModal : t) }));
    }
    setEditTeamModal(null);
    show("✅ تم تحديث الفريق");
  };

  const deleteTeam = (id) => {
    setTournaments(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));
    show("🗑️ تم حذف الفريق", COLORS.danger);
  };

  const addTeam = () => {
    if (!newTeam.name) { show("⚠️ أدخل اسم الفريق", COLORS.warning); return; }
    setTournaments(prev => ({ ...prev, teams: [...prev.teams, { ...newTeam, id: Date.now(), p: Number(newTeam.p), w: Number(newTeam.w), d: Number(newTeam.d), l: Number(newTeam.l), pts: Number(newTeam.pts) }] }));
    setNewTeam({ name: "", p: 0, w: 0, d: 0, l: 0, pts: 0 });
    setAddTeamModal(false);
    show("✅ تم إضافة الفريق");
  };

  const saveScorer = () => {
    if (editScorerModal.id) {
      setTournaments(prev => ({ ...prev, scorers: prev.scorers.map(s => s.id === editScorerModal.id ? { ...editScorerModal, goals: Number(editScorerModal.goals) } : s) }));
    }
    setEditScorerModal(null);
    show("✅ تم تحديث الهداف");
  };

  const deleteScorer = (id) => {
    setTournaments(prev => ({ ...prev, scorers: prev.scorers.filter(s => s.id !== id) }));
    show("🗑️ تم حذف الهداف", COLORS.danger);
  };

  const addScorer = () => {
    if (!newScorer.name) { show("⚠️ أدخل اسم اللاعب", COLORS.warning); return; }
    setTournaments(prev => ({ ...prev, scorers: [...prev.scorers, { ...newScorer, id: Date.now(), goals: Number(newScorer.goals) }] }));
    setNewScorer({ name: "", goals: 0, team: "" });
    setAddScorerModal(false);
    show("✅ تم إضافة الهداف");
  };

  const sortedTeams   = [...tournaments.teams].sort((a, b) => b.pts - a.pts);
  const sortedScorers = [...tournaments.scorers].sort((a, b) => b.goals - a.goals);

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>🏆 البطولات</div>

      {/* المباراة القادمة */}
      <div style={{ background: "linear-gradient(135deg,#1a0d00,#3d2200)", border: `1px solid ${COLORS.warning}44`, borderRadius: 18, padding: "20px", marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: COLORS.warning, fontWeight: 700, marginBottom: 14 }}>⚡ المباراة القادمة</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 420, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isDesktop ? 44 : 32 }}>⚽</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 6 }}>النادي 1</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 900, color: COLORS.warning }}>VS</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>الجمعة ١٠:٠٠ ص</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isDesktop ? 44 : 32 }}>🏟️</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 6 }}>النادي 2</div>
          </div>
        </div>
      </div>

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ترتيب الفرق */}
        <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>ترتيب الفرق</div>
            {canEdit && (
              <button onClick={() => setAddTeamModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ فريق</button>
            )}
          </div>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.surface }}>
                  {["#", "الفريق", "ل", "ت", "خ", "نق", canEdit ? "" : null].filter(h => h !== null).map((h, i) => (
                    <th key={i} style={{ padding: "11px 8px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i === 0 ? `${COLORS.accent}08` : "transparent" }}>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? COLORS.accent : COLORS.textSecondary }}>{i + 1}</td>
                    <td style={{ padding: "11px 8px", fontSize: 13, color: COLORS.textPrimary, fontWeight: i === 0 ? 700 : 400 }}>{t.name}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.accent }}>{t.w}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.textSecondary }}>{t.d}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.danger }}>{t.l}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{t.pts}</td>
                    {canEdit && (
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={() => setEditTeamModal({ ...t })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                          <button onClick={() => deleteTeam(t.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* الهدافون - مدير ومدرب فقط */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>🥅 الهدافون</div>
            {canEdit && (
              <button onClick={() => setAddScorerModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ هداف</button>
            )}
          </div>

          {(user.role === "مدير" || user.role === "مدرب") ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedScorers.map((s, i) => (
                <div key={s.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: i === 0 ? `${COLORS.accentGold}22` : COLORS.surface, border: `1px solid ${i === 0 ? COLORS.accentGold : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? COLORS.accentGold : COLORS.textSecondary }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.team}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 40 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? COLORS.accentGold : COLORS.textPrimary }}>{s.goals}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary }}>هدف</div>
                  </div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setEditScorerModal({ ...s })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                      <button onClick={() => deleteScorer(s.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "30px", textAlign: "center", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div>جدول الهدافين للمدير والمدرب فقط</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addTeamModal && (
        <Modal title="➕ إضافة فريق" onClose={() => setAddTeamModal(false)}>
          <Field label="اسم الفريق" value={newTeam.name} onChange={v => setNewTeam(p => ({ ...p, name: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="المباريات" value={String(newTeam.p)} onChange={v => setNewTeam(p => ({ ...p, p: v }))} type="number" />
            <Field label="فوز" value={String(newTeam.w)} onChange={v => setNewTeam(p => ({ ...p, w: v }))} type="number" />
            <Field label="تعادل" value={String(newTeam.d)} onChange={v => setNewTeam(p => ({ ...p, d: v }))} type="number" />
            <Field label="خسارة" value={String(newTeam.l)} onChange={v => setNewTeam(p => ({ ...p, l: v }))} type="number" />
            <Field label="النقاط" value={String(newTeam.pts)} onChange={v => setNewTeam(p => ({ ...p, pts: v }))} type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddTeamModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addTeam} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {editTeamModal && (
        <Modal title="✏️ تعديل الفريق" onClose={() => setEditTeamModal(null)}>
          <Field label="اسم الفريق" value={editTeamModal.name} onChange={v => setEditTeamModal(p => ({ ...p, name: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="المباريات" value={String(editTeamModal.p)} onChange={v => setEditTeamModal(p => ({ ...p, p: Number(v) }))} type="number" />
            <Field label="فوز" value={String(editTeamModal.w)} onChange={v => setEditTeamModal(p => ({ ...p, w: Number(v) }))} type="number" />
            <Field label="تعادل" value={String(editTeamModal.d)} onChange={v => setEditTeamModal(p => ({ ...p, d: Number(v) }))} type="number" />
            <Field label="خسارة" value={String(editTeamModal.l)} onChange={v => setEditTeamModal(p => ({ ...p, l: Number(v) }))} type="number" />
            <Field label="النقاط" value={String(editTeamModal.pts)} onChange={v => setEditTeamModal(p => ({ ...p, pts: Number(v) }))} type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditTeamModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveTeam} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}

      {addScorerModal && (
        <Modal title="➕ إضافة هداف" onClose={() => setAddScorerModal(false)}>
          <Field label="اسم اللاعب" value={newScorer.name} onChange={v => setNewScorer(p => ({ ...p, name: v }))} />
          <Field label="النادي" value={newScorer.team} onChange={v => setNewScorer(p => ({ ...p, team: v }))} />
          <Field label="عدد الأهداف" value={String(newScorer.goals)} onChange={v => setNewScorer(p => ({ ...p, goals: v }))} type="number" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddScorerModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addScorer} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {editScorerModal && (
        <Modal title="✏️ تعديل الهداف" onClose={() => setEditScorerModal(null)}>
          <Field label="اسم اللاعب" value={editScorerModal.name} onChange={v => setEditScorerModal(p => ({ ...p, name: v }))} />
          <Field label="النادي" value={editScorerModal.team} onChange={v => setEditScorerModal(p => ({ ...p, team: v }))} />
          <Field label="عدد الأهداف" value={String(editScorerModal.goals)} onChange={v => setEditScorerModal(p => ({ ...p, goals: Number(v) }))} type="number" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditScorerModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveScorer} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── صفحة المكافآت ──
function RewardsPage({ user, users }) {
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
// ── صفحة الملف الشخصي ──
function ProfilePage({ user, users, setUsers }) {
  const [tab, setTab] = useState("info");
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const child = user.role === "ولي أمر" ? users.find(u => u.id === user.childId) : null;
  const profileUser = child || user;
  const isAdmin = user.role === "مدير";
  const canEditData = isAdmin || user.permissions?.editData;
  const canEditMedical = isAdmin || user.permissions?.editMedical;
  const canEditRatings = isAdmin || user.permissions?.editRatings;

  const [editInfo, setEditInfo] = useState({ ...profileUser });
  const [editMedical, setEditMedical] = useState({ ...(profileUser.medical || {}) });
  const [editRatings, setEditRatings] = useState({ ...(profileUser.ratings || {}) });
  const [editMode, setEditMode] = useState(false);

  const saveInfo = async () => {
    await supabase.from('users').update({
      name: editInfo.name,
      phone: editInfo.phone,
      position: editInfo.position,
      custom_role: editInfo.customRole,
    }).eq('id', profileUser.id);
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, ...editInfo } : u));
    setEditMode(false);
    show("✅ تم حفظ البيانات");
  };

  const saveMedical = async () => {
    await supabase.from('users').update({ medical: editMedical }).eq('id', profileUser.id);
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, medical: editMedical } : u));
    show("✅ تم حفظ السجل الطبي");
  };

  const saveRatings = async () => {
    await supabase.from('users').update({ ratings: editRatings }).eq('id', profileUser.id);
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, ratings: editRatings } : u));
    show("✅ تم حفظ التقييمات");
  };

  const roleColor = r => r === "مدير" ? COLORS.purple : r === "مدرب" ? COLORS.accentGold : r === "ولي أمر" ? COLORS.accentBlue : COLORS.accent;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {user.role === "ولي أمر" && child && (
        <div style={{ background: COLORS.accentBlue + "15", border: `1px solid ${COLORS.accentBlue}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: COLORS.accentBlue }}>
          👨‍👦 تعرض ملف ابنك: <strong>{child.name}</strong>
        </div>
      )}

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* بطاقة البروفايل */}
        <div>
          <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "24px", marginBottom: 14, textAlign: "center", position: "relative" }}>
            <div style={{ width: 82, height: 82, borderRadius: "50%", background: "linear-gradient(135deg,#00c896,#0066cc)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#fff", boxShadow: "0 0 30px #00c89655" }}>{profileUser.name[0]}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{profileUser.name}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, margin: "4px 0 8px" }}>
              {profileUser.customRole || profileUser.role}
              {profileUser.position !== "-" ? ` · ${profileUser.position}` : ""}
            </div>
            {profileUser.membership !== "-" && <Badge text={`عضوية ${profileUser.membership}`} color={COLORS.accentGold} />}
            <div style={{ marginTop: 8 }}><Badge text={profileUser.status || "نشط"} color={profileUser.status === "موقوف" ? COLORS.danger : COLORS.accent} /></div>

            {canEditData && (
              <button onClick={() => editMode ? saveInfo() : setEditMode(true)}
                style={{ marginTop: 14, width: "100%", padding: "9px", background: editMode ? COLORS.accent : COLORS.surface, border: `1px solid ${COLORS.border}`, color: editMode ? "#000" : COLORS.textSecondary, borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                {editMode ? "💾 حفظ التعديلات" : "✏️ تعديل البيانات"}
              </button>
            )}
          </div>

          {/* إحصائيات */}
          {profileUser.role === "لاعب" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard label="الحضور" value={`${profileUser.attendance}٪`} icon="✅" color={COLORS.accent} />
              <StatCard label="النقاط" value={String(profileUser.points)} icon="⭐" color={COLORS.accentGold} />
            </div>
          )}
        </div>

        {/* التبويبات */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { id: "info",        label: "📋 البيانات" },
              { id: "medical",     label: "🏥 الطبي" },
              { id: "performance", label: "📊 الأداء" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px", borderRadius: 12, background: tab === t.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`, color: tab === t.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
            ))}
          </div>

          {/* البيانات الشخصية */}
          {tab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
              {[
                { label: "الاسم", key: "name", icon: "👤" },
                { label: "رقم الهوية", key: "id", icon: "🪪" },
                { label: "رقم الجوال", key: "phone", icon: "📱" },
                { label: "المركز", key: "position", icon: "⚽" },
                { label: "المسمى الوظيفي", key: "customRole", icon: "🏷️" },
              ].map((item, i) => (
                <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                    {editMode && canEditData ? (
                      <input value={editInfo[item.key] || ""} onChange={e => setEditInfo(p => ({ ...p, [item.key]: e.target.value }))}
                        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 8, padding: "4px 8px", fontSize: 13, width: "100%", marginTop: 2, boxSizing: "border-box" }} />
                    ) : (
                      <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginTop: 2 }}>{profileUser[item.key] || "-"}</div>
                    )}
                  </div>
                </div>
              ))}
              {!canEditData && (
                <div style={{ gridColumn: "1/-1", background: COLORS.warning + "15", border: `1px solid ${COLORS.warning}33`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.warning }}>
                  ⚠️ لا تملك صلاحية تعديل البيانات الشخصية
                </div>
              )}
            </div>
          )}

          {/* السجل الطبي */}
          {tab === "medical" && (
            <div>
              {(isAdmin || canEditMedical || user.role === "ولي أمر" || user.id === profileUser.id) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "الحالة الصحية", key: "health", icon: "💚" },
                    { label: "الإصابات السابقة", key: "injuries", icon: "🩹" },
                    { label: "الحساسية", key: "allergies", icon: "🌿" },
                    { label: "الأدوية", key: "medications", icon: "💊" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 16px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                        {canEditMedical ? (
                          <input value={editMedical[item.key] || ""} onChange={e => setEditMedical(p => ({ ...p, [item.key]: e.target.value }))}
                            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 8, padding: "4px 8px", fontSize: 13, width: "100%", marginTop: 2, boxSizing: "border-box" }} />
                        ) : (
                          <div style={{ fontSize: 14, color: COLORS.textPrimary, marginTop: 2 }}>{profileUser.medical?.[item.key] || "لا يوجد"}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {canEditMedical && (
                    <button onClick={saveMedical} style={{ padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>💾 حفظ السجل الطبي</button>
                  )}
                </div>
              ) : (
                <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "40px", textAlign: "center", color: COLORS.textSecondary }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                  <div>السجل الطبي محمي — يظهر للمدير وأصحاب الصلاحية فقط</div>
                </div>
              )}
            </div>
          )}

          {/* تقييم الأداء */}
          {tab === "performance" && (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 18 }}>📊 تقييم الموسم</div>
              {profileUser.role === "لاعب" ? (
                <>
                  {[
                    { label: "السرعة",        key: "speed",    color: COLORS.accent },
                    { label: "التمرير",       key: "passing",  color: COLORS.accentBlue },
                    { label: "التسديد",       key: "shooting", color: COLORS.warning },
                    { label: "الدفاع",        key: "defense",  color: COLORS.purple },
                    { label: "الروح الرياضية",key: "spirit",   color: COLORS.accentGold },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: COLORS.textSecondary }}>{s.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {canEditRatings && (
                            <input type="number" min="0" max="100" value={editRatings[s.key] || 0}
                              onChange={e => setEditRatings(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                              style={{ width: 52, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: s.color, borderRadius: 6, padding: "2px 6px", fontSize: 13, fontWeight: 700, textAlign: "center" }} />
                          )}
                          <span style={{ color: s.color, fontWeight: 700, minWidth: 36 }}>{profileUser.ratings?.[s.key] || 0}٪</span>
                        </div>
                      </div>
                      <MiniBar percent={profileUser.ratings?.[s.key] || 0} color={s.color} />
                    </div>
                  ))}
                  {canEditRatings && (
                    <button onClick={saveRatings} style={{ width: "100%", marginTop: 8, padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>💾 حفظ التقييمات</button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: COLORS.textSecondary }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                  <div>التقييمات متاحة للاعبين فقط</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── صفحة المتجر ──
function StorePage({ products = [], setProducts, user }) {  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("الكل");
  const [showCart, setShowCart] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const filtered = category === "الكل" ? products : products.filter(p => p.category === category);
  const total = cart.reduce((s, p) => s + p.price, 0);

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>🛒 المتجر</div>
        <button onClick={() => setShowCart(true)} style={{ background: cart.length > 0 ? COLORS.accent : COLORS.cardBg, color: cart.length > 0 ? "#000" : COLORS.textSecondary, border: `1px solid ${cart.length > 0 ? COLORS.accent : COLORS.border}`, borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          🛒 {cart.length > 0 ? `${cart.length} منتج` : "السلة"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {["الكل", "ملابس", "إكسسوار", "حقائب", "معدات"].map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12 }}>
        {filtered.map((p, i) => (
          <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: isDesktop ? 52 : 44, marginBottom: 8, background: COLORS.surface, borderRadius: 12, padding: "12px" }}>{p.img}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 8 }}>{p.category}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.accentGold, marginBottom: 10 }}>{p.price} <span style={{ fontSize: 10, fontWeight: 400 }}>ر.س</span></div>
            <button onClick={() => { setCart(prev => [...prev, p]); show(`✅ تم إضافة ${p.name}`); }}
              style={{ width: "100%", padding: "8px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>أضف للسلة</button>
          </div>
        ))}
      </div>

      {showCart && (
        <Modal title="🛒 سلة المشتريات" onClose={() => setShowCart(false)}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
              <div>السلة فارغة</div>
            </div>
          ) : (
            <>
              {cart.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{item.img}</span>
                    <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: COLORS.accentGold, fontWeight: 700 }}>{item.price} ر.س</span>
                    <button onClick={() => setCart(prev => prev.filter((_, j) => j !== i))} style={{ background: COLORS.danger + "22", border: "none", color: COLORS.danger, borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "12px 0", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, color: COLORS.textPrimary }}>الإجمالي</span>
                <span style={{ fontWeight: 900, color: COLORS.accentGold, fontSize: 18 }}>{total} ر.س</span>
              </div>
              <button onClick={() => { setCart([]); setShowCart(false); show("✅ تم إتمام الشراء بنجاح!"); }}
                style={{ width: "100%", marginTop: 8, padding: "13px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>✓ إتمام الشراء</button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── صفحة الإشعارات ──
function NotificationsPage({ user, notifications, setNotifications }) {
  const [sendModal, setSendModal] = useState(false);
  const [newNotif, setNewNotif] = useState({ msg: "", type: "training", target: "الكل" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canSend = user.role === "مدير" || user.permissions?.sendNotifications;
  const icons   = { match: "⚽", absence: "❌", payment: "💳", award: "⭐", training: "🏃", general: "📢" };
  const colors  = { match: COLORS.warning, absence: COLORS.danger, payment: COLORS.accentBlue, award: COLORS.accentGold, training: COLORS.accent, general: COLORS.purple };

  const myNotifs = notifications.filter(n => n.roles.includes(user.role));
  const unread   = myNotifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sendNotification = async () => {
    if (!newNotif.msg.trim()) { show("⚠️ أدخل نص الإشعار", COLORS.warning); return; }
    const targetRoles = newNotif.target === "الكل"
      ? ["مدير", "مدرب", "لاعب", "ولي أمر"]
      : newNotif.target === "اللاعبين"
      ? ["لاعب"]
      : newNotif.target === "المدربين"
      ? ["مدرب"]
      : ["ولي أمر"];

    const { data } = await supabase.from('notifications').insert({
      type: newNotif.type,
      msg: newNotif.msg,
      time: "الآن",
      read: false,
      roles: targetRoles,
      sender: user.name,
    }).select().single();

    if (data) setNotifications(prev => [{ ...data, roles: data.roles || [] }, ...prev]);
    setNewNotif({ msg: "", type: "training", target: "الكل" });
    setSendModal(false);
    show("✅ تم إرسال الإشعار");
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>🔔 الإشعارات</div>
          {unread > 0 && <div style={{ fontSize: 12, color: COLORS.danger, marginTop: 2 }}>{unread} غير مقروء</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canSend && (
            <button onClick={() => setSendModal(true)} style={{ padding: "8px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📤 إرسال</button>
          )}
          <button onClick={markAllRead} style={{ padding: "8px 14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>قراءة الكل</button>
        </div>
      </div>

      <div style={{ maxWidth: isDesktop ? 700 : "100%", margin: "0 auto" }}>
        {myNotifs.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🔔</div>
            <div style={{ fontSize: 15 }}>لا توجد إشعارات</div>
          </div>
        )}
        {myNotifs.map(n => (
          <div key={n.id} style={{ background: n.read ? COLORS.cardBg : `${colors[n.type] || COLORS.accent}08`, border: `1px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent) + "33"}`, borderRight: `4px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent)}`, borderRadius: 14, padding: "15px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${colors[n.type] || COLORS.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icons[n.type] || "📢"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{n.msg}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{n.time}</span>
                {n.sender && <span style={{ fontSize: 11, color: COLORS.accent }}>· من: {n.sender}</span>}
              </div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[n.type] || COLORS.accent, flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>

      {sendModal && (
        <Modal title="📤 إرسال إشعار" onClose={() => setSendModal(false)}>
          <Field label="نوع الإشعار" value={newNotif.type} onChange={v => setNewNotif(p => ({ ...p, type: v }))}
            options={[{ value: "training", label: "🏃 تدريب" }, { value: "match", label: "⚽ مباراة" }, { value: "general", label: "📢 عام" }, { value: "award", label: "⭐ مكافأة" }]} />
          <Field label="المستهدفون" value={newNotif.target} onChange={v => setNewNotif(p => ({ ...p, target: v }))}
            options={["الكل", "اللاعبين", "المدربين", "أولياء الأمور"]} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>نص الإشعار</div>
            <textarea value={newNotif.msg} onChange={e => setNewNotif(p => ({ ...p, msg: e.target.value }))} rows={3} placeholder="اكتب نص الإشعار..."
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSendModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={sendNotification} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>📤 إرسال</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
// ── صفحة المكتبة ──
function LibraryPage({ user, library, setLibrary }) {
  const [category, setCategory] = useState("الكل");
  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", category: "تدريب", type: "image", emoji: "📸" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canAdd = user.role === "مدير" || user.permissions?.editLibrary;
  const cats = ["الكل", "تدريب", "مباراة", "هدف", "إنجاز"];
  const filtered = category === "الكل" ? library : library.filter(i => i.category === category);

  const emojiMap = { تدريب: "🏃", مباراة: "🎬", هدف: "⚽", إنجاز: "🏆", image: "📸", video: "🎥", achievement: "🥇", goal: "⚽" };

  const addItem = async () => {
    if (!newItem.title.trim()) { show("⚠️ أدخل عنواناً", COLORS.warning); return; }
    const { data } = await supabase.from('library').insert({
      type: newItem.type,
      category: newItem.category,
      title: newItem.title,
      emoji: emojiMap[newItem.category] || "📸",
      date: new Date().toLocaleDateString("ar-SA"),
      added_by: user.name,
    }).select().single();
    if (data) setLibrary(prev => [{ ...data, addedBy: data.added_by }, ...prev]);
    setNewItem({ title: "", category: "تدريب", type: "image", emoji: "📸" });
    setAddModal(false);
    show("✅ تم الإضافة للمكتبة");
  };

  const deleteItem = async (id) => {
    await supabase.from('library').delete().eq('id', id);
    setLibrary(prev => prev.filter(i => i.id !== id));
    show("🗑️ تم الحذف", COLORS.danger);
  };

  const typeColors = { image: COLORS.accent, video: COLORS.accentBlue, achievement: COLORS.accentGold, goal: COLORS.warning };
  const typeLabels = { image: "📸 صورة", video: "🎥 فيديو", achievement: "🏆 إنجاز", goal: "⚽ هدف" };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>📚 المكتبة</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{library.length} عنصر</div>
        </div>
        {canAdd && (
          <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ إضافة</button>
        )}
      </div>

      {/* فلتر التصنيفات */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      {/* الشبكة */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textSecondary }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 15 }}>لا توجد عناصر في هذا التصنيف</div>
          {canAdd && <button onClick={() => setAddModal(true)} style={{ marginTop: 16, padding: "10px 24px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>+ أضف أول عنصر</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 14 }}>
          {filtered.map((item, i) => (
            <div key={item.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", position: "relative" }}>
              {/* صورة مصغرة */}
              <div style={{ height: isDesktop ? 140 : 110, background: `linear-gradient(135deg,${typeColors[item.type] || COLORS.accent}22,${typeColors[item.type] || COLORS.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDesktop ? 56 : 44, position: "relative" }}>
                {item.emoji}
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <Badge text={typeLabels[item.type] || "📸 صورة"} color={typeColors[item.type] || COLORS.accent} />
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>{item.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Badge text={item.category} color={COLORS.textSecondary} />
                    <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 4 }}>{item.date}</div>
                  </div>
                  {canAdd && (
                    <button onClick={() => deleteItem(item.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 7, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                  )}
                </div>
                {item.addedBy && <div style={{ fontSize: 10, color: COLORS.accent, marginTop: 4 }}>أضافه: {item.addedBy}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة */}
      {addModal && (
        <Modal title="➕ إضافة للمكتبة" onClose={() => setAddModal(false)}>
          <Field label="العنوان" value={newItem.title} onChange={v => setNewItem(p => ({ ...p, title: v }))} placeholder="مثال: تدريب الأحد ١ يونيو" />
          <Field label="التصنيف" value={newItem.category} onChange={v => setNewItem(p => ({ ...p, category: v }))}
            options={["تدريب", "مباراة", "هدف", "إنجاز"]} />
          <Field label="النوع" value={newItem.type} onChange={v => setNewItem(p => ({ ...p, type: v }))}
            options={[{ value: "image", label: "📸 صورة" }, { value: "video", label: "🎥 فيديو" }, { value: "achievement", label: "🏆 إنجاز" }, { value: "goal", label: "⚽ هدف" }]} />
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{emojiMap[newItem.category] || "📸"}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>معاينة المحتوى</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>يمكن رفع الصور والفيديوهات بعد ربط التطبيق بـ Supabase Storage</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addItem} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── صفحة الاشتراكات ──
function SubscriptionsPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [signed, setSigned] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const [done, setDone] = useState(false);
  const { isDesktop } = useWindowSize();

  if (done) return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent, marginBottom: 8 }}>تم الاشتراك بنجاح!</div>
      <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>مرحباً بك في عضوية {memberships[selected]?.name}</div>
      <button onClick={() => { setDone(false); setStep(1); setSelected(null); setSigned(false); setPayMethod(null); }}
        style={{ padding: "13px 36px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>العودة</button>
    </div>
  );

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>الاشتراكات</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>اختر باقتك وأتمّ التسجيل</div>

      {/* شريط الخطوات */}
      <div style={{ display: "flex", gap: 4, marginBottom: 26, maxWidth: isDesktop ? 500 : "100%" }}>
        {["اختر الباقة", "العقد", "الدفع"].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: step > i ? COLORS.accent : COLORS.border, marginBottom: 5 }} />
            <div style={{ fontSize: 11, color: step > i ? COLORS.accent : COLORS.textSecondary, fontWeight: step > i ? 700 : 400 }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: "repeat(2,1fr)", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            {memberships.map((m, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ background: m.bg, border: `2px solid ${selected === i ? m.color : m.color + "33"}`, borderRadius: 16, padding: "18px", cursor: "pointer", position: "relative", boxShadow: selected === i ? `0 0 20px ${m.color}44` : "none" }}>
                {m.popular && <div style={{ position: "absolute", top: -9, right: 14, background: m.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 30 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: m.color, fontWeight: 800, fontSize: 16 }}>{m.name}</div>
                      <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 2 }}>{m.features.length} مزايا</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.textPrimary }}>{m.price}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary }}>ر.س/شهر</div>
                  </div>
                </div>
                {m.features.map((f, j) => <div key={j} style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 5, display: "flex", gap: 5 }}><span style={{ color: m.color }}>✓</span>{f}</div>)}
              </div>
            ))}
          </div>
          <button onClick={() => selected !== null && setStep(2)}
            style={{ width: isDesktop ? 300 : "100%", padding: "14px", borderRadius: 13, background: selected !== null ? COLORS.accent : COLORS.surface, border: "none", color: selected !== null ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: selected !== null ? "pointer" : "not-allowed" }}>
            التالي: مراجعة العقد ←
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: isDesktop ? 580 : "100%" }}>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>📄 عقد الاشتراك</div>
            {["يلتزم المشترك بالحضور في المواعيد المحددة.", "يحق للأكاديمية إيقاف الاشتراك في حالة الإخلال بالنظام.", "لا يُسترد الاشتراك المدفوع إلا في حالات الإصابة الموثقة.", "يوافق المشترك على تصوير اللاعب لأغراض الأكاديمية.", "تسري هذه الشروط من تاريخ التوقيع.", "يلتزم ولي الأمر بالالتزام بأوقات الإحضار والاستلام.", "يحق للأكاديمية تعديل الجداول مع إشعار مسبق."].map((c, i) => (
              <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 14, borderRight: `2px solid ${COLORS.border}`, lineHeight: 1.7 }}>{c}</div>
            ))}
          </div>
          <div onClick={() => setSigned(!signed)} style={{ background: signed ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", marginBottom: 18 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: signed ? COLORS.accent : COLORS.surface, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {signed && <span style={{ color: "#000", fontSize: 14, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary }}>أوافق على جميع الشروط والأحكام وأوقّع إلكترونياً</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>رجوع</button>
            <button onClick={() => signed && setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 12, background: signed ? COLORS.accent : COLORS.surface, border: "none", color: signed ? "#000" : COLORS.textSecondary, fontWeight: 800, cursor: signed ? "pointer" : "not-allowed" }}>التالي ←</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: isDesktop ? 480 : "100%" }}>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>ملخص الطلب</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: COLORS.textSecondary }}>الباقة</span>
              <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{memberships[selected]?.name} {memberships[selected]?.icon}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: COLORS.textSecondary }}>المدة</span>
              <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>شهري</span>
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: 15 }}>الإجمالي</span>
              <span style={{ color: COLORS.accentGold, fontWeight: 900, fontSize: 22 }}>{memberships[selected]?.price} ر.س</span>
            </div>
          </div>
          {[{ label: "مدى / Mada", icon: "💳", desc: "البطاقة المدفوعة مسبقاً" }, { label: "فيزا / Mastercard", icon: "💳", desc: "بطاقة الائتمان" }, { label: "Apple Pay", icon: "🍎", desc: "الدفع السريع" }].map((m, i) => (
            <div key={i} onClick={() => setPayMethod(i)} style={{ background: payMethod === i ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${payMethod === i ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "15px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{m.desc}</div>
              </div>
              {payMethod === i && <span style={{ color: COLORS.accent, fontSize: 18, fontWeight: 900 }}>✓</span>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 13, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>رجوع</button>
            <button onClick={() => payMethod !== null && setDone(true)}
              style={{ flex: 2, padding: "13px", borderRadius: 13, background: payMethod !== null ? `linear-gradient(135deg,${COLORS.accent},#00a07a)` : COLORS.surface, border: "none", color: payMethod !== null ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: payMethod !== null ? "pointer" : "not-allowed" }}>
              ✓ إتمام الدفع
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function PlayersManager({ users, setUsers, user }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("attendance");
  const [editRatings, setEditRatings] = useState({});
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editRatings;
  const canEditAtt = user.role === "مدير" || user.permissions?.editSchedule;

  const players = users.filter(u => u.role === "لاعب");
  const weeks = selected ? Math.ceil((selected.attendanceLog || []).length / 7) : 0;

  const toggleAtt = (idx) => {
    if (!canEditAtt) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const log = [...(u.attendanceLog || [])];
      log[idx] = !log[idx];
      const pct = log.length ? Math.round(log.filter(Boolean).length / log.length * 100) : 0;
      const updated = { ...u, attendanceLog: log, attendance: pct };
      setSelected(updated);
      return updated;
    }));
  };

  const addWeek = () => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const log = [...(u.attendanceLog || []), false, false, false, false, false, false, false];
      const pct = log.length ? Math.round(log.filter(Boolean).length / log.length * 100) : 0;
      const updated = { ...u, attendanceLog: log, attendance: pct };
      setSelected(updated);
      return updated;
    }));
    show("✅ تم إضافة أسبوع جديد");
  };

  const saveRatings = () => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const updated = { ...u, ratings: { ...u.ratings, ...editRatings } };
      setSelected(updated);
      return updated;
    }));
    show("✅ تم حفظ التقييمات");
  };

  const days = ["أحد", "اثن", "ثلا", "أرب", "خمس", "جمع", "سبت"];

  return (
    <div>
      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* قائمة اللاعبين */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>⚽ قائمة اللاعبين ({players.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: isDesktop ? 0 : 16 }}>
            {players.map(p => (
              <div key={p.id} onClick={() => { setSelected(p); setEditRatings(p.ratings || {}); setTab("attendance"); }}
                style={{ background: selected?.id === p.id ? `${COLORS.accent}18` : COLORS.cardBg, border: `1px solid ${selected?.id === p.id ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar letter={p.name[0]} size={36} color={COLORS.accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.position} · {p.membership}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: p.attendance >= 80 ? COLORS.accent : COLORS.danger }}>{p.attendance}٪</div>
                  <div style={{ fontSize: 9, color: COLORS.textSecondary }}>حضور</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل اللاعب */}
        {selected ? (
          <div>
            {/* هيدر اللاعب */}
            <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar letter={selected.name[0]} size={52} color={COLORS.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{selected.position} · عضوية {selected.membership}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <Badge text={`${selected.attendance}٪ حضور`} color={selected.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                  <Badge text={`${selected.points} نقطة`} color={COLORS.accentGold} />
                  <Badge text={selected.status || "نشط"} color={COLORS.accent} />
                </div>
              </div>
            </div>

            {/* تبويبات */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "attendance", label: "✅ الحضور" },
                { id: "performance", label: "📊 الأداء" },
                { id: "info", label: "👤 البيانات" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex: 1, padding: "9px", borderRadius: 11, background: tab === t.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`, color: tab === t.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* سجل الحضور */}
            {tab === "attendance" && (
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>سجل الحضور الكامل</div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                      {(selected.attendanceLog || []).filter(Boolean).length} حضور من {(selected.attendanceLog || []).length} جلسة
                    </div>
                  </div>
                  {canEditAtt && (
                    <button onClick={addWeek} style={{ padding: "8px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ أسبوع جديد</button>
                  )}
                </div>

                {/* عرض أسبوعي */}
                {Array.from({ length: Math.ceil((selected.attendanceLog || []).length / 7) }).map((_, weekIdx) => (
                  <div key={weekIdx} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8, fontWeight: 600 }}>
                      الأسبوع {weekIdx + 1}
                      <span style={{ marginRight: 8, color: COLORS.accent }}>
                        ({(selected.attendanceLog || []).slice(weekIdx * 7, weekIdx * 7 + 7).filter(Boolean).length}/7 حضور)
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {days.map((day, dayIdx) => {
                        const globalIdx = weekIdx * 7 + dayIdx;
                        const val = (selected.attendanceLog || [])[globalIdx];
                        if (globalIdx >= (selected.attendanceLog || []).length) return (
                          <div key={dayIdx} style={{ flex: 1, height: 52, borderRadius: 10, background: COLORS.surface, border: `1px dashed ${COLORS.border}` }} />
                        );
                        return (
                          <button key={dayIdx} onClick={() => toggleAtt(globalIdx)}
                            style={{ flex: 1, height: 52, borderRadius: 10, background: val ? `${COLORS.accent}22` : `${COLORS.danger}15`, border: `1px solid ${val ? COLORS.accent + "55" : COLORS.danger + "33"}`, cursor: canEditAtt ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                            <span style={{ fontSize: 14 }}>{val ? "✅" : "❌"}</span>
                            <span style={{ fontSize: 9, color: COLORS.textSecondary }}>{day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* شريط الحضور */}
                <div style={{ marginTop: 16, background: COLORS.surface, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: COLORS.textSecondary }}>نسبة الحضور الإجمالية</span>
                    <span style={{ color: selected.attendance >= 80 ? COLORS.accent : COLORS.danger, fontWeight: 800 }}>{selected.attendance}٪</span>
                  </div>
                  <MiniBar percent={selected.attendance} color={selected.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                </div>
              </div>
            )}

            {/* تقييم الأداء */}
            {tab === "performance" && (
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 18 }}>📊 تقييم الأداء</div>
                {[
                  { label: "السرعة",         key: "speed",    color: COLORS.accent },
                  { label: "التمرير",        key: "passing",  color: COLORS.accentBlue },
                  { label: "التسديد",        key: "shooting", color: COLORS.warning },
                  { label: "الدفاع",         key: "defense",  color: COLORS.purple },
                  { label: "الروح الرياضية", key: "spirit",   color: COLORS.accentGold },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>{s.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {canEdit && (
                          <input type="number" min="0" max="100"
                            value={editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)}
                            onChange={e => setEditRatings(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                            style={{ width: 58, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: s.color, borderRadius: 8, padding: "4px 8px", fontSize: 14, fontWeight: 800, textAlign: "center" }} />
                        )}
                        <span style={{ color: s.color, fontWeight: 800, minWidth: 40 }}>
                          {editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)}٪
                        </span>
                      </div>
                    </div>
                    <MiniBar percent={editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)} color={s.color} />
                  </div>
                ))}
                {canEdit && (
                  <button onClick={saveRatings}
                    style={{ width: "100%", padding: "13px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer", marginTop: 8 }}>
                    💾 حفظ التقييمات
                  </button>
                )}
              </div>
            )}

            {/* البيانات */}
            {tab === "info" && (
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
                {[
                  { label: "الاسم",     value: selected.name,       icon: "👤" },
                  { label: "الهوية",    value: selected.id,         icon: "🪪" },
                  { label: "الجوال",    value: selected.phone,      icon: "📱" },
                  { label: "المركز",    value: selected.position,   icon: "⚽" },
                  { label: "العضوية",   value: selected.membership, icon: "🏅" },
                  { label: "الحالة",    value: selected.status,     icon: "🔵" },
                  { label: "النقاط",    value: String(selected.points), icon: "⭐" },
                  { label: "الحضور",    value: `${selected.attendance}٪`, icon: "✅" },
                ].map((item, i) => (
                  <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value || "-"}</div>
                    </div>
                  </div>
                ))}

                {/* السجل الطبي */}
                {selected.medical && (
                  <>
                    <div style={{ gridColumn: "1/-1", fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 8 }}>🏥 السجل الطبي</div>
                    {[
                      { label: "الحالة الصحية",    key: "health",      icon: "💚" },
                      { label: "الإصابات",          key: "injuries",    icon: "🩹" },
                      { label: "الحساسية",          key: "allergies",   icon: "🌿" },
                      { label: "الأدوية",           key: "medications", icon: "💊" },
                    ].map((item, i) => (
                      <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                          <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>{selected.medical[item.key] || "لا يوجد"}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "60px", textAlign: "center", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>⚽</div>
            <div style={{ fontSize: 15 }}>اختر لاعباً من القائمة لعرض ملفه</div>
          </div>
        )}
      </div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
    </div>
  );
}
function FinanceManager({ user }) {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [addModal, setAddModal]       = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [newRecord, setNewRecord]     = useState({ type: "revenue", label: "", amount: "", date: "", note: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editData;

  useEffect(() => { loadFinance(); }, []);

  const loadFinance = async () => {
    setLoading(true);
    const { data } = await supabase.from('finance').select('*').order('id', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const addRecord = async () => {
    if (!newRecord.label.trim() || !newRecord.amount) { show("⚠️ أكمل الحقول المطلوبة", COLORS.warning); return; }
    const { data } = await supabase.from('finance').insert({
      type: newRecord.type, label: newRecord.label,
      amount: Number(newRecord.amount), date: newRecord.date, note: newRecord.note,
    }).select().single();
    if (data) setRecords(prev => [data, ...prev]);
    setNewRecord({ type: "revenue", label: "", amount: "", date: "", note: "" });
    setAddModal(false);
    show("✅ تم إضافة السجل");
  };

  const deleteRecord = async (id) => {
    await supabase.from('finance').delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
    show("🗑️ تم الحذف", COLORS.danger);
    setDetailModal(null);
  };

  const totalRevenue = records.filter(r => r.type === "revenue").reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  const netProfit    = totalRevenue - totalExpense;
  const filtered     = filter === "all" ? records : records.filter(r => r.type === filter);
  const formatNum    = (n) => n.toLocaleString("ar-SA");

  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px", color: COLORS.textSecondary }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
      <div>جاري تحميل البيانات...</div>
    </div>
  );

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {/* بطاقات الملخص */}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr", gap: 12, marginBottom: 22 }}>
        {[
          { label: "إجمالي الإيرادات", value: formatNum(totalRevenue), icon: "💰", color: COLORS.accent,     type: "revenue" },
          { label: "إجمالي المصروفات", value: formatNum(totalExpense), icon: "📉", color: COLORS.danger,     type: "expense" },
          { label: "صافي الربح",        value: formatNum(netProfit),    icon: "📈", color: COLORS.accentGold, type: "all" },
        ].map((card, i) => (
          <div key={i} onClick={() => setFilter(filter === card.type ? "all" : card.type)}
            style={{ background: filter === card.type ? `${card.color}18` : COLORS.cardBg, border: `2px solid ${filter === card.type ? card.color : COLORS.border}`, borderRadius: 16, padding: "20px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: card.color }}>{card.value} <span style={{ fontSize: 12, fontWeight: 400 }}>ر.س</span></div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{card.label}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: card.color }}>
              {filter === card.type ? "✓ يعرض هذا النوع — اضغط للإلغاء" : "اضغط لعرض التفاصيل"}
            </div>
          </div>
        ))}
      </div>

      {/* شريط الأدوات */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "الكل",       value: "all" },
            { label: "💰 إيرادات", value: "revenue" },
            { label: "📉 مصروفات", value: "expense" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{ padding: "7px 14px", borderRadius: 20, background: filter === f.value ? COLORS.accent : COLORS.cardBg, border: `1px solid ${filter === f.value ? COLORS.accent : COLORS.border}`, color: filter === f.value ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>
        {canEdit && (
          <button onClick={() => setAddModal(true)}
            style={{ padding: "9px 18px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            + إضافة
          </button>
        )}
      </div>

      {/* الجدول */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ background: COLORS.surface }}>
                {["النوع", "البيان", "المبلغ", "التاريخ", "ملاحظة", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 14px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: r.type === "revenue" ? `${COLORS.accent}05` : `${COLORS.danger}05` }}>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <Badge text={r.type === "revenue" ? "💰 إيراد" : "📉 مصروف"} color={r.type === "revenue" ? COLORS.accent : COLORS.danger} />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{r.label}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 14, fontWeight: 800, color: r.type === "revenue" ? COLORS.accent : COLORS.danger }}>
                    {r.type === "revenue" ? "+" : "-"}{formatNum(Number(r.amount))}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 12, color: COLORS.textSecondary }}>{r.date || "-"}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{r.note || "-"}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <button onClick={() => setDetailModal(r)}
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: COLORS.textSecondary }}>لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة */}
      {addModal && (
        <Modal title="➕ إضافة سجل مالي" onClose={() => setAddModal(false)}>
          <Field label="النوع" value={newRecord.type} onChange={v => setNewRecord(p => ({ ...p, type: v }))}
            options={[{ value: "revenue", label: "💰 إيراد" }, { value: "expense", label: "📉 مصروف" }]} />
          <Field label="البيان *" value={newRecord.label} onChange={v => setNewRecord(p => ({ ...p, label: v }))} placeholder="مثال: اشتراكات شهر يوليو" />
          <Field label="المبلغ (ر.س) *" value={newRecord.amount} onChange={v => setNewRecord(p => ({ ...p, amount: v }))} type="number" />
          <Field label="التاريخ" value={newRecord.date} onChange={v => setNewRecord(p => ({ ...p, date: v }))} placeholder="٢٠٢٦/٧/١" />
          <Field label="ملاحظة" value={newRecord.note} onChange={v => setNewRecord(p => ({ ...p, note: v }))} placeholder="تفاصيل إضافية" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addRecord} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {/* Modal تفاصيل */}
      {detailModal && (
        <Modal title="📋 تفاصيل السجل" onClose={() => setDetailModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { label: "النوع",   value: detailModal.type === "revenue" ? "💰 إيراد" : "📉 مصروف" },
              { label: "البيان",  value: detailModal.label },
              { label: "المبلغ",  value: `${formatNum(Number(detailModal.amount))} ر.س` },
              { label: "التاريخ", value: detailModal.date || "-" },
              { label: "ملاحظة", value: detailModal.note || "-" },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.label}</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
          {canEdit && (
            <button onClick={() => deleteRecord(detailModal.id)}
              style={{ width: "100%", padding: "12px", background: COLORS.danger, border: "none", color: "#fff", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>
              🗑️ حذف هذا السجل
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
// ── لوحة تحكم المدير ──
function AdminPage({ user, users, setUsers, products, setProducts, loadData }) {
  const [adminTab, setAdminTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("الكل");
  const [permTarget, setPermTarget] = useState(null);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const EMPTY_FORM = {
    name: "", id: "", password: "", role: "لاعب", customRole: "لاعب",
    position: "-", phone: "", membership: "فضي", status: "نشط",
    childId: "", coachId: "",
    permissions: { editSchedule: false, editData: false, sendNotifications: false, editRatings: false, editMedical: false, editLibrary: false, editTournaments: false },
  };

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setModal("form"); };
  const openEdit = (u) => { setForm({ ...EMPTY_FORM, ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions || {}) } }); setEditId(u.id); setModal("form"); };

  const saveAccount = async () => {
    if (!form.name?.trim() || !form.id?.trim() || !form.password?.trim()) {
      show("⚠️ الاسم ورقم الهوية وكلمة السر مطلوبة", COLORS.warning); return;
    }
    if (!editId && users.find(u => u.id === form.id)) {
      show("⚠️ رقم الهوية مستخدم مسبقاً", COLORS.warning); return;
    }
    const newUserData = {
      id: form.id,
      password: form.password,
      role: form.role,
      custom_role: form.customRole || form.role,
      name: form.name,
      phone: form.phone,
      membership: form.membership || '-',
      status: form.status || 'نشط',
      position: form.position || '-',
      points: 0,
      attendance: 0,
      child_id: form.childId || null,
      coach_id: form.coachId || null,
      permissions: form.permissions || {},
      medical: { health: "جيدة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
      ratings: { speed: 70, passing: 70, shooting: 70, defense: 70, spirit: 70 },
      attendance_log: [false, false, false, false, false, false, false, false, false, false],    };

    if (editId) {
      await supabase.from('users').update({
        ...newUserData,
        points: form.points,
        attendance: form.attendance,
      }).eq('id', editId);
      show("✅ تم تحديث الحساب");
    } else {
      const { error } = await supabase.from('users').insert(newUserData);
      if (error) { show(`⚠️ خطأ: ${error.message}`, COLORS.danger); return; }
      show("✅ تم إضافة الحساب");
    }
    await loadData();
    setModal(null);
  };

  const toggleSuspend = async (u) => {
    const newStatus = u.status === "موقوف" ? "نشط" : "موقوف";
    await supabase.from('users').update({ status: newStatus }).eq('id', u.id);
    setUsers(prev => prev.map(a => a.id === u.id ? { ...a, status: newStatus } : a));
    show(u.status === "موقوف" ? "✅ تم تفعيل الحساب" : "⛔ تم إيقاف الحساب", u.status === "موقوف" ? COLORS.accent : COLORS.danger);
    setModal(null);
  };

  const deleteAccount = async (id) => {
    await supabase.from('users').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
    show("🗑️ تم حذف الحساب", COLORS.danger);
    setModal(null);
  };

  const savePermissions = async () => {
    await supabase.from('users').update({ permissions: permTarget.permissions }).eq('id', permTarget.id);
    setUsers(prev => prev.map(u => u.id === permTarget.id ? { ...u, permissions: permTarget.permissions } : u));
    show("✅ تم حفظ الصلاحيات");
    setPermTarget(null);
  };

  const filtered = users.filter(u => {
    const matchRole   = filterRole === "الكل" || u.role === filterRole;
    const matchSearch = u.name.includes(search) || u.id.includes(search) || u.phone?.includes(search);
    return matchRole && matchSearch;
  });

  const players  = users.filter(u => u.role === "لاعب");
  const coaches  = users.filter(u => u.role === "مدرب");
  const parents  = users.filter(u => u.role === "ولي أمر");
  const avgAtt   = players.length ? Math.round(players.reduce((s, p) => s + (p.attendance || 0), 0) / players.length) : 0;
  const statusColor = s => s === "موقوف" ? COLORS.danger : s === "معلق" ? COLORS.warning : COLORS.accent;
  const roleColor   = r => r === "مدير" ? COLORS.purple : r === "مدرب" ? COLORS.accentGold : r === "ولي أمر" ? COLORS.accentBlue : COLORS.accent;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ background: "linear-gradient(135deg,#1a0020,#2d003a)", border: "1px solid #a855f744", borderRadius: 16, padding: "15px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 26 }}>🔐</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.purple }}>لوحة تحكم المدير</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>صلاحيات كاملة · {users.length} حساب مسجل</div>
        </div>
      </div>

      {/* تبويبات */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 2 }}>
        {[
          { id: "overview",     label: "📊 نظرة عامة" },
          { id: "accounts",     label: "👥 الحسابات" },
          { id: "permissions",  label: "🔑 الصلاحيات" },
          { id: "finance",      label: "💰 المالية" },
          { id: "reports",      label: "📈 التقارير" },
          { id: "pricing",      label: "💲 الأسعار" },
          { id: "players",      label: "⚽ اللاعبون" },
        ].map(t => (
          <button key={t.id} onClick={() => setAdminTab(t.id)} style={{ padding: "9px 16px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: adminTab === t.id ? COLORS.purple : COLORS.cardBg, border: `1px solid ${adminTab === t.id ? COLORS.purple : COLORS.border}`, color: adminTab === t.id ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {/* نظرة عامة */}
      {adminTab === "overview" && (
        <div>
          <div style={{ overflowX: "auto", marginBottom: 22, paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(4,160px)", gap: 12, minWidth: isDesktop ? "unset" : "max-content" }}>
              <StatCard label="لاعب" value={String(players.length)} icon="⚽" color={COLORS.accent} sub={`${players.filter(p=>p.status!=="موقوف").length} نشط`} />
              <StatCard label="مدرب" value={String(coaches.length)} icon="🏅" color={COLORS.accentGold} sub="في الأكاديمية" />
              <StatCard label="ولي أمر" value={String(parents.length)} icon="👨‍👦" color={COLORS.accentBlue} sub="مسجل" />
              <StatCard label="متوسط الحضور" value={`${avgAtt}٪`} icon="📊" color={COLORS.purple} sub="هذا الموسم" />
            </div>
          </div>

          <div style={{ display: "block", gap: 20 }}>
            {/* رسم بياني */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: isDesktop ? 0 : 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 18 }}>📈 الإيرادات مقابل المصروفات</div>
              <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 150 }}>
                {financialData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 120 }}>
                      <div style={{ width: "45%", background: COLORS.accent, height: `${(d.revenue/80000)*100}%`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                      <div style={{ width: "45%", background: COLORS.danger+"88", height: `${(d.expenses/80000)*100}%`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                    </div>
                    <div style={{ fontSize: 9, color: COLORS.textSecondary }}>{d.month.slice(0,3)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, background: COLORS.accent, borderRadius: 2 }} /><span style={{ fontSize: 11, color: COLORS.textSecondary }}>إيرادات</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, background: COLORS.danger+"88", borderRadius: 2 }} /><span style={{ fontSize: 11, color: COLORS.textSecondary }}>مصروفات</span></div>
              </div>
            </div>

            {/* توزيع */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>توزيع الحسابات</div>
              {[
                { role: "لاعب",     color: COLORS.accent },
                { role: "مدرب",     color: COLORS.accentGold },
                { role: "ولي أمر",  color: COLORS.accentBlue },
                { role: "مدير",     color: COLORS.purple },
              ].map((r, i) => {
                const count = users.filter(u => u.role === r.role).length;
                const pct   = users.length ? Math.round((count/users.length)*100) : 0;
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: COLORS.textSecondary }}>{r.role}</span>
                      <span style={{ color: r.color, fontWeight: 700 }}>{count} ({pct}٪)</span>
                    </div>
                    <MiniBar percent={pct} color={r.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* الحسابات */}
      {adminTab === "accounts" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={openAdd} style={{ padding: "10px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>+ إضافة</button>
            <input placeholder="بحث بالاسم أو الهوية أو الجوال..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "10px 14px", fontSize: 13 }} />
          </div>

          <div style={{ display: "flex", gap: 7, marginBottom: 14, overflowX: "auto" }}>
            {["الكل", "لاعب", "مدرب", "ولي أمر", "مدير"].map(r => (
              <button key={r} onClick={() => setFilterRole(r)} style={{ padding: "6px 14px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: filterRole === r ? COLORS.purple : COLORS.cardBg, border: `1px solid ${filterRole === r ? COLORS.purple : COLORS.border}`, color: filterRole === r ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{r}</button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 }}>{filtered.length} حساب</div>

          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map(u => (
              <div key={u.id} style={{ background: COLORS.cardBg, border: `1px solid ${u.status === "موقوف" ? COLORS.danger+"44" : COLORS.border}`, borderRadius: 15, padding: "15px", marginBottom: isDesktop ? 0 : 10, opacity: u.status === "موقوف" ? 0.75 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar letter={u.name[0]} size={44} color={roleColor(u.role)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{u.name}</span>
                      <Badge text={u.status || "نشط"} color={statusColor(u.status || "نشط")} />
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.customRole || u.role}{u.position !== "-" ? ` · ${u.position}` : ""}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>🪪 {u.id} · 📱 {u.phone}</div>
                    {u.membership !== "-" && <div style={{ fontSize: 10, color: COLORS.accentGold, marginTop: 2 }}>عضوية {u.membership}</div>}
                    {u.role === "لاعب" && <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>نقاط: {u.points} · حضور: {u.attendance}٪</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(u)} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: COLORS.accentBlue+"22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>
                  <button onClick={() => { setPermTarget({ ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions||{}) } }); }} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: COLORS.purple+"22", border: `1px solid ${COLORS.purple}44`, color: COLORS.purple, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🔑 صلاحيات</button>
                  <button onClick={() => { setActionTarget(u); setModal("suspend"); }} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: u.status==="موقوف" ? COLORS.accent+"22" : COLORS.warning+"22", border: `1px solid ${u.status==="موقوف" ? COLORS.accent+"44" : COLORS.warning+"44"}`, color: u.status==="موقوف" ? COLORS.accent : COLORS.warning, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{u.status==="موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
                  <button onClick={() => { setActionTarget(u); setModal("delete"); }} style={{ padding: "7px 10px", borderRadius: 9, background: COLORS.danger+"22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الصلاحيات */}
      {adminTab === "permissions" && (
        <div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>اختر حساباً لتعديل صلاحياته المخصصة</div>
          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {users.filter(u => u.role !== "مدير").map(u => (
              <div key={u.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: isDesktop ? 0 : 10, cursor: "pointer" }}
                onClick={() => setPermTarget({ ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions||{}) } })}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar letter={u.name[0]} size={38} color={roleColor(u.role)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.customRole || u.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Object.entries(u.permissions || {}).filter(([,v]) => v).map(([k]) => (
                    <Badge key={k} text={PERMISSION_LABELS[k] || k} color={COLORS.accent} />
                  ))}
                  {!Object.values(u.permissions || {}).some(Boolean) && (
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>لا توجد صلاحيات مخصصة</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المالية */}
      {adminTab === "finance" && (
  <FinanceManager user={user} />
)}
{/* الأسعار */}
{adminTab === "pricing" && (
  <div>
    {/* أسعار الاشتراكات */}
    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>
      💳 أسعار باقات الاشتراك
    </div>
    <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
      {memberships.map((m, i) => (
        <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: isDesktop ? 0 : 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{m.icon}</span>
            <div style={{ color: m.color, fontWeight: 800, fontSize: 15 }}>{m.name}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 5 }}>السعر الشهري (ر.س)</div>
            <input
              type="number"
              defaultValue={m.price}
              onChange={e => { m.price = e.target.value; }}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: m.color, borderRadius: 10, padding: "10px 12px", fontSize: 18, fontWeight: 900, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 5 }}>المزايا (سطر لكل ميزة)</div>
            <textarea
              defaultValue={m.features.join("\n")}
              onChange={e => { m.features = e.target.value.split("\n").filter(f => f.trim()); }}
              rows={4}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 12, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={() => show(`✅ تم تحديث باقة ${m.name}`)}
            style={{ width: "100%", padding: "10px", background: m.color, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            💾 حفظ التغييرات
          </button>
        </div>
      ))}
    </div>

    {/* أسعار المتجر */}
    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>
      🛒 أسعار منتجات المتجر
    </div>
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: COLORS.surface }}>
            {["المنتج", "التصنيف", "السعر (ر.س)", "حفظ"].map((h, i) => (
              <th key={i} style={{ padding: "12px 14px", fontSize: 12, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{p.img}</span>
                  <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{p.name}</span>
                </div>
              </td>
              <td style={{ padding: "12px 14px", textAlign: "center" }}>
                <Badge text={p.category} color={COLORS.textSecondary} />
              </td>
              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                <input
                  type="number"
                  defaultValue={p.price}
                  onChange={e => { p.price = Number(e.target.value); }}
                  style={{ width: 90, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.accentGold, borderRadius: 8, padding: "6px 10px", fontSize: 14, fontWeight: 800, textAlign: "center" }}
                />
              </td>
              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                <button
                  onClick={() => show(`✅ تم تحديث سعر ${p.name}`)}
                  style={{ padding: "7px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                  💾
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
      {/* اللاعبون */}
{adminTab === "players" && (
  <PlayersManager users={users} setUsers={setUsers} user={user} />
)}
      {/* التقارير */}
      {adminTab === "reports" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 14, marginBottom: 20 }}>
            {[
              { title: "متوسط حضور اللاعبين", value: `${avgAtt}٪`, icon: "✅", color: COLORS.accent },
              { title: "متوسط حضور المدربين", value: `${coaches.length ? Math.round(coaches.reduce((s,c)=>s+c.attendance,0)/coaches.length) : 0}٪`, icon: "👨‍🏫", color: COLORS.accentGold },
              { title: "نمو الاشتراكات", value: "+١٢٪", icon: "📈", color: COLORS.accentBlue },
              { title: "رضا أولياء الأمور", value: "٩١٪", icon: "👨‍👦", color: COLORS.purple },
            ].map((r, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${r.color}22`, border: `1px solid ${r.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{r.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: r.color, marginTop: 2 }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>أداء المدربين</div>
            {coaches.length === 0 ? (
              <div style={{ color: COLORS.textSecondary, fontSize: 13, textAlign: "center", padding: "20px" }}>لا يوجد مدربون</div>
            ) : coaches.map((c, i) => {
              const r = [4.9, 4.7, 4.5][i] || 4.3;
              return (
                <div key={c.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar letter={c.name[0]} size={30} color={COLORS.accentGold} />
                      <div>
                        <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>حضور {c.attendance}٪</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.accentGold, fontWeight: 800 }}>⭐ {r}</span>
                  </div>
                  <MiniBar percent={(r/5)*100} color={COLORS.accentGold} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal إضافة/تعديل حساب */}
      {modal === "form" && (
        <Modal title={editId ? "✏️ تعديل الحساب" : "➕ إضافة حساب جديد"} onClose={() => setModal(null)} wide={isDesktop}>
          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="الاسم *" value={form.name || ""} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <Field label="رقم الهوية *" value={form.id || ""} onChange={v => setForm(p => ({ ...p, id: v }))} />
            <Field label="كلمة السر *" value={form.password || ""} onChange={v => setForm(p => ({ ...p, password: v }))} />
            <Field label="نوع الحساب" value={form.role || "لاعب"} onChange={v => setForm(p => ({ ...p, role: v, customRole: v }))}
              options={["لاعب", "مدرب", "ولي أمر", "مدير"]} />
            <Field label="المسمى المخصص" value={form.customRole || ""} onChange={v => setForm(p => ({ ...p, customRole: v }))} placeholder="مثال: مساعد مدرب" />
            <Field label="رقم الجوال" value={form.phone || ""} onChange={v => setForm(p => ({ ...p, phone: v }))} />
            {form.role === "لاعب" && <>
              <Field label="المركز" value={form.position || "-"} onChange={v => setForm(p => ({ ...p, position: v }))} options={["مهاجم", "وسط", "دفاع", "حارس", "-"]} />
              <Field label="العضوية" value={form.membership || "فضي"} onChange={v => setForm(p => ({ ...p, membership: v }))} options={["برونزي", "فضي", "ذهبي", "ماسي"]} />
              <Field label="المدرب المسؤول (ID)" value={form.coachId || ""} onChange={v => setForm(p => ({ ...p, coachId: v }))} placeholder="رقم هوية المدرب" />
            </>}
            {form.role === "ولي أمر" && (
              <Field label="رقم هوية اللاعب (الابن)" value={form.childId || ""} onChange={v => setForm(p => ({ ...p, childId: v }))} placeholder="رقم هوية اللاعب" />
            )}
            <Field label="الحالة" value={form.status || "نشط"} onChange={v => setForm(p => ({ ...p, status: v }))} options={["نشط", "موقوف", "معلق"]} />
          </div>

          {/* الصلاحيات */}
          {form.role !== "مدير" && (
            <div style={{ marginTop: 16, background: COLORS.surface, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>🔑 الصلاحيات المخصصة:</div>
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <div key={key} onClick={() => setForm(p => ({ ...p, permissions: { ...(p.permissions||{}), [key]: !(p.permissions||{})[key] } }))}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: form.permissions?.[key] ? COLORS.accent+"15" : COLORS.cardBg, border: `1px solid ${form.permissions?.[key] ? COLORS.accent+"55" : COLORS.border}`, borderRadius: 10, cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: form.permissions?.[key] ? COLORS.accent : COLORS.surface, border: `1px solid ${form.permissions?.[key] ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.permissions?.[key] && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: form.permissions?.[key] ? COLORS.accent : COLORS.textSecondary }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveAccount} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>{editId ? "✅ حفظ التعديلات" : "✅ إضافة الحساب"}</button>
          </div>
        </Modal>
      )}

      {/* Modal الصلاحيات المستقلة */}
      {permTarget && (
        <Modal title={`🔑 صلاحيات: ${permTarget.name}`} onClose={() => setPermTarget(null)}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>اختر الصلاحيات التي تريد منحها لهذا الحساب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <div key={key} onClick={() => setPermTarget(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: permTarget.permissions[key] ? COLORS.accent+"15" : COLORS.surface, border: `1px solid ${permTarget.permissions[key] ? COLORS.accent+"55" : COLORS.border}`, borderRadius: 12, cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: permTarget.permissions[key] ? COLORS.accent : COLORS.cardBg, border: `1px solid ${permTarget.permissions[key] ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {permTarget.permissions[key] && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: permTarget.permissions[key] ? COLORS.accent : COLORS.textSecondary, fontWeight: permTarget.permissions[key] ? 700 : 400 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setPermTarget(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={savePermissions} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ الصلاحيات</button>
          </div>
        </Modal>
      )}

      {/* Modal تأكيد الإيقاف */}
      {modal === "suspend" && actionTarget && (
        <Modal title="تأكيد" onClose={() => setModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.8 }}>
            {actionTarget.status === "موقوف" ? `تفعيل حساب "${actionTarget.name}"؟` : `إيقاف حساب "${actionTarget.name}"؟ لن يتمكن من الدخول.`}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={() => toggleSuspend(actionTarget)} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: actionTarget.status === "موقوف" ? COLORS.accent : COLORS.warning, color: "#000", fontWeight: 800, cursor: "pointer" }}>{actionTarget.status === "موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
          </div>
        </Modal>
      )}

      {/* Modal تأكيد الحذف */}
      {modal === "delete" && actionTarget && (
        <Modal title="⚠️ تأكيد الحذف" onClose={() => setModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.8 }}>
            حذف <strong style={{ color: COLORS.textPrimary }}>"{actionTarget.name}"</strong> نهائياً؟ لا يمكن التراجع.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={() => deleteAccount(actionTarget.id)} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.danger, color: "#fff", fontWeight: 800, cursor: "pointer" }}>🗑️ حذف نهائياً</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
// ── التطبيق الرئيسي ──
const ALL_TABS = [
  { id: "home",          icon: "🏠", label: "الرئيسية" },
  { id: "schedule",      icon: "📅", label: "الجداول" },
  { id: "tournaments",   icon: "🏆", label: "البطولات" },
  { id: "rewards",       icon: "⭐", label: "المكافآت" },
  { id: "store",         icon: "🛒", label: "المتجر" },
  { id: "profile",       icon: "👤", label: "الملف" },
  { id: "notifications", icon: "🔔", label: "الإشعارات" },
  { id: "subscriptions", icon: "💳", label: "الاشتراك" },
  { id: "library",       icon: "📚", label: "المكتبة" },
  { id: "admin",         icon: "🔐", label: "الإدارة" },
];
function MoreMenu({ myTabs, active, setActive }) {
  const [open, setOpen] = useState(false);
  const extraTabs = myTabs.slice(5);

  return (
    <>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "fixed", bottom: 70, left: 8, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "8px", zIndex: 70, minWidth: 160, boxShadow: "0 -4px 20px #00000044" }}>
            {extraTabs.map(t => (
              <button key={t.id} onClick={() => { setActive(t.id); setOpen(false); }}
                style={{ width: "100%", padding: "11px 14px", background: active === t.id ? `${COLORS.accent}18` : "none", border: "none", borderRadius: 10, color: active === t.id ? COLORS.accent : COLORS.textSecondary, display: "flex", alignItems: "center", gap: 10, fontWeight: active === t.id ? 800 : 400, fontSize: 14, cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => setOpen(!open)} style={{ flex: 1, padding: "9px 4px 10px", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
        <span style={{ fontSize: 21 }}>···</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: open ? COLORS.accent : COLORS.textSecondary }}>المزيد</span>
        {open && <div style={{ position: "absolute", bottom: 0, width: 28, height: 2, background: COLORS.accent, borderRadius: "2px 2px 0 0" }} />}
      </button>
    </>
  );
}
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
  const [loading, setLoading]             = useState(true);
  const { isDesktop }                     = useWindowSize();

  // ── تحميل البيانات من Supabase ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: usersData },
        { data: scheduleData },
        { data: notifsData },
        { data: teamsData },
        { data: scorersData },
        { data: libraryData },
        { data: productsData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('schedule').select('*').order('order'),
        supabase.from('notifications').select('*').order('id', { ascending: false }),
        supabase.from('tournament_teams').select('*'),
        supabase.from('tournament_scorers').select('*'),
        supabase.from('library').select('*').order('id', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('settings').select('*'),
      ]);

      if (usersData) setUsers(usersData.map(u => ({
        ...u,
        customRole: u.custom_role,
        childId: u.child_id,
        coachId: u.coach_id,
        attendanceLog: u.attendance_log || [],
      })));
      if (scheduleData) setSchedule(scheduleData);
      if (notifsData) setNotifications(notifsData.map(n => ({ ...n, roles: n.roles || [] })));
      if (teamsData && scorersData) setTournaments({ teams: teamsData, scorers: scorersData });
      if (libraryData) setLibrary(libraryData.map(i => ({ ...i, addedBy: i.added_by })));
      if (productsData) setProducts(productsData.map(p => ({ ...p, images: p.images || [] })));
      if (settingsData) {
        const msg = settingsData.find(s => s.key === 'director_message');
        if (msg) setDirectorMsg(msg.value);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── حفظ رسالة المدير ──
  const saveDirectorMsg = async (msg) => {
    setDirectorMsg(msg);
    await supabase.from('settings').upsert({ key: 'director_message', value: msg });
  };

  // ── حفظ المستخدمين ──
  // eslint-disable-next-line no-unused-vars
  const saveUsers = async (newUsers) => {
    setUsers(newUsers);
  };

  const saveUser = async (userData) => {
    const dbUser = {
      id: userData.id,
      password: userData.password,
      role: userData.role,
      custom_role: userData.customRole || userData.role,
      name: userData.name,
      phone: userData.phone,
      membership: userData.membership,
      status: userData.status,
      position: userData.position,
      points: userData.points || 0,
      attendance: userData.attendance || 0,
      child_id: userData.childId || null,
      coach_id: userData.coachId || null,
      permissions: userData.permissions || {},
      medical: userData.medical || {},
      ratings: userData.ratings || {},
      attendance_log: userData.attendanceLog || [],
    };
    await supabase.from('users').upsert(dbUser);
    await loadData();
  };

  const deleteUser = async (id) => {
    await supabase.from('users').delete().eq('id', id);
    await loadData();
  };

  // ── حفظ الجداول ──
  const saveSchedule = async (newSchedule) => {
    setSchedule(newSchedule);
  };

  const addScheduleItem = async (item) => {
    await supabase.from('schedule').insert({
      day: item.day, time: item.time, type: item.type,
      team: item.team, location: item.location, order: item.order || 0,
    });
    await loadData();
  };

  const updateScheduleItem = async (item) => {
    await supabase.from('schedule').update({
      day: item.day, time: item.time, type: item.type,
      team: item.team, location: item.location, order: item.order,
    }).eq('id', item.id);
    await loadData();
  };

  const deleteScheduleItem = async (id) => {
    await supabase.from('schedule').delete().eq('id', id);
    await loadData();
  };

  // ── حفظ الإشعارات ──
  const addNotification = async (notif) => {
    await supabase.from('notifications').insert({
      type: notif.type, msg: notif.msg, time: 'الآن',
      read: false, roles: notif.roles, sender: notif.sender,
    });
    await loadData();
  };

  const markNotifsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    await loadData();
  };

  // ── حفظ البطولات ──
  const addTournamentTeam = async (team) => {
    await supabase.from('tournament_teams').insert(team);
    await loadData();
  };

  const updateTournamentTeam = async (team) => {
    await supabase.from('tournament_teams').update(team).eq('id', team.id);
    await loadData();
  };

  const deleteTournamentTeam = async (id) => {
    await supabase.from('tournament_teams').delete().eq('id', id);
    await loadData();
  };

  const addTournamentScorer = async (scorer) => {
    await supabase.from('tournament_scorers').insert(scorer);
    await loadData();
  };

  const updateTournamentScorer = async (scorer) => {
    await supabase.from('tournament_scorers').update(scorer).eq('id', scorer.id);
    await loadData();
  };

  const deleteTournamentScorer = async (id) => {
    await supabase.from('tournament_scorers').delete().eq('id', id);
    await loadData();
  };

  // ── حفظ المكتبة ──
  const addLibraryItem = async (item) => {
    await supabase.from('library').insert({
      type: item.type, category: item.category, title: item.title,
      emoji: item.emoji, date: item.date, added_by: item.addedBy,
    });
    await loadData();
  };

  const deleteLibraryItem = async (id) => {
    await supabase.from('library').delete().eq('id', id);
    await loadData();
  };

  // ── حفظ المنتجات ──
  const addProduct = async () => {
    if (!newProduct.name.trim()) { show("⚠️ أدخل اسم المنتج", COLORS.warning); return; }
    const { data } = await supabase.from('products').insert({
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      img: newProduct.img,
      images: [],
    }).select().single();
    if (data) setProducts(prev => [...prev, { ...data, images: [] }]);
    setNewProduct({ name: "", price: 0, category: "ملابس", img: "📦", images: [] });
    setAddModal(false);
    show("✅ تم إضافة المنتج");
  };

  const updateProduct = async (product) => {
    await supabase.from('products').update({
      name: product.name, price: product.price,
      category: product.category, img: product.img, images: product.images || [],
    }).eq('id', product.id);
    await loadData();
  };

  const deleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    show("🗑️ تم حذف المنتج", COLORS.danger);
  };

  const liveUser = currentUser ? users.find(u => u.id === currentUser.id) || currentUser : null;

  const handleLogin  = (user) => { setCurrentUser(user); setActive("home"); };
  const handleLogout = () => { setCurrentUser(null); setActive("home"); };
  const allowedIds = ROLE_TABS[liveUser?.role] || [];
  const myTabs = ALL_TABS.filter(t => allowedIds.includes(t.id));
  const bottomTabs = myTabs.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.read && n.roles?.includes(liveUser?.role)).length;

  const renderPage = () => {
    switch (active) {
      case "home":          return <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} />;
      case "schedule":      return <SchedulePage user={liveUser} schedule={schedule} setSchedule={setSchedule} users={users} setUsers={setUsers} />;
      case "tournaments":   return <TournamentsPage user={liveUser} tournaments={tournaments} setTournaments={setTournaments} />;
      case "rewards":       return <RewardsPage user={liveUser} users={users} />;
      case "store":         return <StorePage products={products} setProducts={setProducts} user={liveUser} />;
      case "profile":       return <ProfilePage user={liveUser} users={users} setUsers={setUsers} />;
      case "notifications": return <NotificationsPage user={liveUser} notifications={notifications} setNotifications={setNotifications} />;
      case "subscriptions": return <SubscriptionsPage />;
      case "library":       return <LibraryPage user={liveUser} library={library} setLibrary={setLibrary} />;
      case "admin":         return liveUser.role === "مدير" ? <AdminPage user={liveUser} users={users} setUsers={setUsers} products={products} setProducts={setProducts} loadData={loadData} /> : <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} />;
      default:              return <HomePage onNav={setActive} user={liveUser} users={users} directorMsg={directorMsg} setDirectorMsg={saveDirectorMsg} />;
    }
  };
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#00c896,#0066cc)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "spin 1s linear infinite" }}>⚽</div>
      <div style={{ color: "#00c896", fontSize: 16, fontWeight: 700 }}>جاري التحميل...</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!liveUser) return <LoginPage onLogin={handleLogin} users={users} />;

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
