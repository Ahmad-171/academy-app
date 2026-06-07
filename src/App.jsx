import { useState, useEffect } from "react";

const COLORS = {
  darkBg: "#0a0e1a",
  cardBg: "#0f1628",
  surface: "#151d35",
  border: "#1e2d50",
  accent: "#00c896",
  accentGold: "#f5c842",
  accentBlue: "#3b82f6",
  textPrimary: "#f0f4ff",
  textSecondary: "#7a8bb5",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const memberships = [
  { name: "برونزي", color: "#cd7f32", bg: "linear-gradient(135deg, #3d2b1f, #6b4226)", price: "٢٥٠", features: ["حضور التدريبات", "متابعة الحضور", "تقارير أساسية"], icon: "🥉" },
  { name: "فضي", color: "#c0c0c0", bg: "linear-gradient(135deg, #2a2a3a, #4a4a6a)", price: "٤٥٠", features: ["كل مزايا البرونزي", "نظام النقاط والمكافآت", "المكتبة الإعلامية", "تقييمات مفصلة"], icon: "🥈" },
  { name: "ذهبي", color: "#f5c842", bg: "linear-gradient(135deg, #3d3000, #7a6000)", price: "٦٥٠", features: ["كل مزايا الفضي", "السجل الطبي", "متجر الأكاديمية", "أولوية في البطولات"], icon: "🥇", popular: true },
  { name: "ماسي", color: "#b9f2ff", bg: "linear-gradient(135deg, #002244, #004488)", price: "٩٥٠", features: ["جميع المزايا", "استشارات خاصة", "خصم ٢٠٪ على المتجر", "دعم أولوية"], icon: "💎" },
];

const financialData = [
  { month: "يناير", revenue: 48000, expenses: 22000 },
  { month: "فبراير", revenue: 52000, expenses: 24000 },
  { month: "مارس", revenue: 61000, expenses: 25000 },
  { month: "أبريل", revenue: 58000, expenses: 23000 },
  { month: "مايو", revenue: 67000, expenses: 26000 },
  { month: "يونيو", revenue: 72000, expenses: 28000 },
];

const products = [
  { id: 1, name: "طقم الأكاديمية الرسمي", price: "٢٨٠", category: "ملابس", img: "👕" },
  { id: 2, name: "شال الأكاديمية", price: "٨٥", category: "إكسسوار", img: "🧣" },
  { id: 3, name: "حقيبة الرياضة", price: "١٥٠", category: "حقائب", img: "🎒" },
  { id: 4, name: "علم الأكاديمية", price: "٦٥", category: "إكسسوار", img: "🚩" },
  { id: 5, name: "طقم التدريب", price: "١٩٠", category: "ملابس", img: "🩳" },
  { id: 6, name: "كرة رسمية", price: "١٢٠", category: "معدات", img: "⚽" },
];

const schedule = [
  { day: "الأحد", time: "٤:٠٠ م", type: "تدريب", team: "U14", location: "ملعب الرئيسي" },
  { day: "الثلاثاء", time: "٥:٠٠ م", type: "تدريب", team: "U14", location: "ملعب الرئيسي" },
  { day: "الجمعة", time: "١٠:٠٠ ص", type: "مباراة", team: "U14 vs النصر", location: "ملعب الدوري" },
  { day: "السبت", time: "٤:٣٠ م", type: "تدريب", team: "U13", location: "ملعب B" },
];

const INITIAL_ACCOUNTS = [
  { id: 1, name: "محمد العتيبي", role: "لاعب", position: "مهاجم", age: 14, phone: "0551234567", membership: "ذهبي", status: "نشط", attendance: 92, points: 840 },
  { id: 2, name: "فهد الشمري", role: "لاعب", position: "وسط", age: 13, phone: "0559876543", membership: "فضي", status: "نشط", attendance: 88, points: 760 },
  { id: 3, name: "عبدالله القحطاني", role: "لاعب", position: "دفاع", age: 15, phone: "0554321098", membership: "ماسي", status: "نشط", attendance: 95, points: 920 },
  { id: 4, name: "سلطان المطيري", role: "لاعب", position: "حارس", age: 14, phone: "0557654321", membership: "برونزي", status: "موقوف", attendance: 85, points: 680 },
  { id: 5, name: "خالد الدوسري", role: "لاعب", position: "مهاجم", age: 13, phone: "0553456789", membership: "فضي", status: "نشط", attendance: 90, points: 810 },
  { id: 6, name: "أ. محمد الغامدي", role: "مدرب", position: "-", age: 34, phone: "0556543210", membership: "-", status: "نشط", attendance: 98, points: 0 },
  { id: 7, name: "والد عمر السالم", role: "ولي أمر", position: "-", age: 42, phone: "0552109876", membership: "ذهبي", status: "نشط", attendance: 0, points: 0 },
];

const EMPTY_FORM = { name: "", role: "لاعب", position: "مهاجم", age: "", phone: "", membership: "فضي", status: "نشط" };

// ── مكونات مساعدة ──
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}22, transparent)` }} />
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{text}</span>;
}

function Avatar({ letter, size = 40, color = COLORS.accent }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}44, ${color}22)`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.4, flexShrink: 0 }}>{letter}</div>
  );
}

function MiniBar({ percent, color }) {
  return (
    <div style={{ background: COLORS.border, borderRadius: 4, height: 6, overflow: "hidden", marginTop: 4 }}>
      <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, width: "min(92vw, 400px)", zIndex: 201, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{title}</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = "text", options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
      )}
    </div>
  );
}
// ── صفحة الرئيسية ──
function HomePage({ onNav }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  
    return (
      <div style={{ padding: "0 0 40px" }}>
        <div style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d2044 50%, #0a1628 100%)", padding: "48px 24px 40px", textAlign: "center", position: "relative", overflow: "hidden", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 60px)` }} />
          <div style={{ width: 90, height: 90, margin: "0 auto 20px", background: "linear-gradient(135deg, #00c896, #0066cc)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 0 40px #00c89644", opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.7)", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>⚽</div>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.textPrimary }}>أكاديمية النجوم</div>
            <div style={{ fontSize: 14, color: COLORS.accent, marginTop: 6, fontWeight: 600, letterSpacing: 2 }}>ACADEMY OF STARS</div>
            <div style={{ marginTop: 24, padding: "20px", background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 16, maxWidth: 400, margin: "24px auto 0", textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar letter="أ" size={48} color={COLORS.accentGold} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>أ. أحمد السالم</div>
                  <div style={{ fontSize: 12, color: COLORS.accentGold }}>مدير الأكاديمية</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.8 }}>"نؤمن بأن كل طفل يحمل بداخله بطلاً، ومهمتنا صقل هذه المواهب وتحويل الأحلام إلى واقع. مرحباً بكم في أكاديمية النجوم."</div>
            </div>
          </div>
        </div>
  
        <div style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <StatCard label="لاعب مسجل" value="٢٤٧" icon="⚽" color={COLORS.accent} sub="↑ ١٢ هذا الشهر" />
            <StatCard label="مدرب محترف" value="١٨" icon="🏅" color={COLORS.accentGold} sub="٦ فروع" />
            <StatCard label="نسبة الحضور" value="٩١٪" icon="📊" color={COLORS.accentBlue} sub="هذا الأسبوع" />
            <StatCard label="بطولة فائزة" value="١٢" icon="🏆" color="#a855f7" sub="هذا الموسم" />
          </div>
  
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>العضويات</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>اختر الباقة المناسبة لك</div>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {memberships.map((m, i) => (
              <div key={i} style={{ minWidth: 200, borderRadius: 20, background: m.bg, border: `1px solid ${m.color}44`, padding: "20px 18px", position: "relative", flexShrink: 0, cursor: "pointer", boxShadow: m.popular ? `0 0 30px ${m.color}33` : "none" }}>
                {m.popular && <div style={{ position: "absolute", top: -10, right: 16, background: m.color, color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ color: m.color, fontWeight: 800, fontSize: 16 }}>{m.name}</div>
                <div style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 900, margin: "8px 0" }}>{m.price} <span style={{ fontSize: 12, color: COLORS.textSecondary }}>ر.س / شهر</span></div>
                {m.features.map((f, j) => (
                  <div key={j} style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}><span style={{ color: m.color }}>✓</span> {f}</div>
                ))}
                <button onClick={() => onNav("subscriptions")} style={{ marginTop: 16, width: "100%", padding: "10px", background: `${m.color}22`, border: `1px solid ${m.color}55`, color: m.color, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>اشترك الآن</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // ── صفحة الملف الشخصي ──
  function ProfilePage() {
    const [editMode, setEditMode] = useState(false);
    const [tab, setTab] = useState("info");
    const [info, setInfo] = useState({ name: "محمد عبدالله العتيبي", id: "١٠٣٤٥٦٧٨٩٠", dob: "١٥ مارس ٢٠١٠", phone: "٠٥٥ ١٢٣ ٤٥٦٧", position: "مهاجم", guardian: "عبدالله العتيبي", guardianPhone: "٠٥٤ ٩٨٧ ٦٥٤٣" });
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ background: "linear-gradient(135deg, #0f1628, #1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "24px", marginBottom: 16, textAlign: "center", position: "relative" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg, #00c896, #0066cc)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#fff", boxShadow: "0 0 30px #00c89655" }}>م</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary }}>{info.name.split(" ")[0]}</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, margin: "4px 0" }}>لاعب · مهاجم · U14</div>
          <Badge text="عضوية ذهبية 🥇" color={COLORS.accentGold} />
          <button onClick={() => setEditMode(!editMode)} style={{ position: "absolute", top: 16, left: 16, background: editMode ? COLORS.accent : COLORS.surface, border: `1px solid ${COLORS.border}`, color: editMode ? "#000" : COLORS.textSecondary, padding: "6px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>{editMode ? "💾 حفظ" : "✏️ تعديل"}</button>
        </div>
  
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{ id: "info", label: "البيانات" }, { id: "medical", label: "السجل الطبي" }, { id: "performance", label: "الأداء" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px", borderRadius: 12, background: tab === t.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`, color: tab === t.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>
  
        {tab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "الاسم الكامل", value: info.name, key: "name", icon: "👤" },
              { label: "رقم الهوية", value: info.id, key: "id", icon: "🪪" },
              { label: "تاريخ الميلاد", value: info.dob, key: "dob", icon: "📅" },
              { label: "رقم الجوال", value: info.phone, key: "phone", icon: "📱" },
              { label: "المركز", value: info.position, key: "position", icon: "⚽" },
              { label: "ولي الأمر", value: info.guardian, key: "guardian", icon: "👨‍👦" },
              { label: "جوال ولي الأمر", value: info.guardianPhone, key: "guardianPhone", icon: "📞" },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                  {editMode ? (
                    <input value={info[item.key]} onChange={e => setInfo(prev => ({ ...prev, [item.key]: e.target.value }))} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 8, padding: "4px 8px", fontSize: 14, width: "100%", marginTop: 2 }} />
                  ) : (
                    <div style={{ fontSize: 15, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
  
        {tab === "medical" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#ef444415", border: "1px solid #ef444433", borderRadius: 14, padding: "16px" }}>
              <div style={{ color: "#ef4444", fontWeight: 800, marginBottom: 8 }}>⚠️ معلومات سرية</div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary }}>تظهر حسب الصلاحيات فقط</div>
            </div>
            {[
              { label: "الحالة الصحية", value: "ممتازة", icon: "💚" },
              { label: "الإصابات السابقة", value: "شد عضلي - أبريل ٢٠٢٤", icon: "🩹" },
              { label: "الحساسية", value: "لا يوجد", icon: "🌿" },
              { label: "الأدوية", value: "لا يوجد", icon: "💊" },
              { label: "ملاحظات الطبيب", value: "يحتاج إحماء جيد قبل التدريب", icon: "📋" },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: COLORS.textPrimary, marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {tab === "performance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>تقييم الموسم</div>
              {[
                { label: "السرعة", val: 85, color: COLORS.accent },
                { label: "التمرير", val: 72, color: COLORS.accentBlue },
                { label: "التسديد", val: 91, color: "#f59e0b" },
                { label: "الدفاع", val: 60, color: "#a855f7" },
                { label: "الروح الرياضية", val: 95, color: COLORS.accentGold },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: COLORS.textSecondary }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.val}٪</span>
                  </div>
                  <MiniBar percent={s.val} color={s.color} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StatCard label="الحضور" value="٩٢٪" icon="✅" color={COLORS.accent} />
              <StatCard label="النقاط" value="٨٤٠" icon="⭐" color={COLORS.accentGold} />
            </div>
          </div>
        )}
      </div>
    );
  }
  // ── صفحة الجداول ──
function SchedulePage() {
    const [qrVisible, setQrVisible] = useState(false);
    const [attendance, setAttendance] = useState({});
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>الجداول والمواعيد</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>أسبوع ١ - ٧ يونيو ٢٠٢٦</div>
  
        <div style={{ background: "linear-gradient(135deg, #00c89615, #0066cc15)", border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📲 تسجيل الحضور بالباركود</div>
          {qrVisible ? (
            <div style={{ width: 140, height: 140, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 8, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {Array(49).fill(0).map((_, i) => (
                <div key={i} style={{ background: [0,1,2,6,7,13,14,15,16,20,21,27,28,29,30,34,35,41,42,43,44,45,46,48].includes(i) ? "#000" : "#fff", borderRadius: 1 }} />
              ))}
            </div>
          ) : (
            <button onClick={() => setQrVisible(true)} style={{ background: COLORS.accent, border: "none", color: "#000", padding: "12px 32px", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>عرض باركود الحضور</button>
          )}
          {qrVisible && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 8 }}>اعرض هذا الرمز للمدرب</div>}
        </div>
  
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {schedule.map((s, i) => (
            <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${s.type === "مباراة" ? "#f59e0b44" : COLORS.border}`, borderRight: `4px solid ${s.type === "مباراة" ? "#f59e0b" : COLORS.accent}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "center", minWidth: 55 }}>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.day}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{s.time}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{s.type}</span>
                  <Badge text={s.type === "مباراة" ? "🏆 مباراة" : "🏃 تدريب"} color={s.type === "مباراة" ? "#f59e0b" : COLORS.accent} />
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{s.team}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>📍 {s.location}</div>
              </div>
              <button
                onClick={() => setAttendance(prev => ({ ...prev, [i]: !prev[i] }))}
                style={{ padding: "8px 12px", borderRadius: 10, background: attendance[i] ? COLORS.accent + "22" : COLORS.surface, border: `1px solid ${attendance[i] ? COLORS.accent : COLORS.border}`, color: attendance[i] ? COLORS.accent : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {attendance[i] ? "✅ حاضر" : "تسجيل"}
              </button>
            </div>
          ))}
        </div>
  
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>سجل الحضور</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr style={{ background: COLORS.surface }}>
                {["اللاعب", "الأحد", "الثلاثاء", "الخميس", "السبت", "النسبة"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 12px", fontSize: 12, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_ACCOUNTS.filter(a => a.role === "لاعب").slice(0, 5).map((p, i) => {
                const att = [true, true, i % 2 === 0, true];
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{p.name.split(" ")[0]}</td>
                    {att.map((a, j) => <td key={j} style={{ padding: "10px", textAlign: "center", fontSize: 16 }}>{a ? "✅" : "❌"}</td>)}
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <Badge text={`${p.attendance}٪`} color={p.attendance > 90 ? COLORS.accent : COLORS.warning} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // ── صفحة البطولات ──
  function TournamentsPage() {
    const [teams] = useState([
      { name: "النجوم U14", p: 8, w: 6, d: 1, l: 1, pts: 19 },
      { name: "المطيري", p: 8, w: 5, d: 2, l: 1, pts: 17 },
      { name: "الأبطال", p: 8, w: 4, d: 1, l: 3, pts: 13 },
      { name: "الوحدة", p: 8, w: 3, d: 2, l: 3, pts: 11 },
      { name: "النصر U14", p: 8, w: 2, d: 1, l: 5, pts: 7 },
    ]);
    const scorers = [
      { name: "محمد العتيبي", goals: 11, team: "النجوم" },
      { name: "كريم السعيد", goals: 9, team: "المطيري" },
      { name: "عمر الحربي", goals: 7, team: "الأبطال" },
      { name: "فهد الشمري", goals: 6, team: "النجوم" },
    ];
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>🏆 البطولات</div>
  
        <div style={{ background: "linear-gradient(135deg, #1a0d00, #3d2200)", border: `1px solid ${COLORS.warning}44`, borderRadius: 20, padding: "20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.warning, fontWeight: 700, marginBottom: 12 }}>⚡ المباراة القادمة</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>⚽</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>النجوم</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.warning }}>VS</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>الجمعة ١٠:٠٠ ص</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>🏟️</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>النصر</div>
            </div>
          </div>
        </div>
  
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>ترتيب الفرق</div>
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 350 }}>
            <thead>
              <tr style={{ background: COLORS.surface }}>
                {["#", "الفريق", "ل", "ت", "خ", "نق"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 8px", fontSize: 12, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i === 0 ? `${COLORS.accent}08` : "transparent" }}>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 14, fontWeight: 800, color: i === 0 ? COLORS.accent : COLORS.textSecondary }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px", fontSize: 13, color: COLORS.textPrimary, fontWeight: i === 0 ? 700 : 400 }}>{t.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 13, color: COLORS.accent }}>{t.w}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 13, color: COLORS.textSecondary }}>{t.d}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 13, color: COLORS.danger }}>{t.l}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{t.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>🥅 الهدافون</div>
        {scorers.map((s, i) => (
          <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === 0 ? `${COLORS.accentGold}22` : COLORS.surface, border: `1px solid ${i === 0 ? COLORS.accentGold : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? COLORS.accentGold : COLORS.textSecondary }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{s.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{s.team}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? COLORS.accentGold : COLORS.textPrimary }}>{s.goals}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>هدف</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // ── صفحة المكافآت ──
  function RewardsPage() {
    const [userPoints] = useState(840);
    const [redeemed, setRedeemed] = useState([]);
    const rewards = [
      { name: "خصم ١٠٪ على الاشتراك", points: 500, icon: "🎫" },
      { name: "قميص الأكاديمية", points: 800, icon: "👕" },
      { name: "حقيبة رياضية", points: 1200, icon: "🎒" },
      { name: "إعفاء شهر كامل", points: 2000, icon: "🎁" },
    ];
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ background: "linear-gradient(135deg, #3d3000, #7a6000, #3d3000)", border: `1px solid ${COLORS.accentGold}44`, borderRadius: 20, padding: "24px", textAlign: "center", marginBottom: 20, boxShadow: `0 0 40px ${COLORS.accentGold}22` }}>
          <div style={{ fontSize: 13, color: COLORS.accentGold, marginBottom: 8, fontWeight: 700 }}>⭐ رصيد نقاطك</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.accentGold, lineHeight: 1 }}>{userPoints}</div>
          <div style={{ fontSize: 13, color: "#ffffff88", marginTop: 4 }}>نقطة</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>٩٢</div>
              <div style={{ fontSize: 11, color: "#ffffff66" }}>يوم حضور</div>
            </div>
            <div style={{ width: 1, background: "#ffffff22" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{redeemed.length}</div>
              <div style={{ fontSize: 11, color: "#ffffff66" }}>مكافآت مستبدلة</div>
            </div>
          </div>
        </div>
  
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>🏅 ترتيب اللاعبين</div>
        {INITIAL_ACCOUNTS.filter(a => a.role === "لاعب").sort((a, b) => b.points - a.points).map((p, i) => (
          <div key={i} style={{ background: i === 0 ? "linear-gradient(90deg, #3d300033, #7a600033)" : COLORS.cardBg, border: `1px solid ${i === 0 ? COLORS.accentGold + "44" : COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: i === 0 ? COLORS.accentGold : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: i < 3 ? "#000" : COLORS.textSecondary }}>{i + 1}</div>
            <Avatar letter={p.name[0]} size={36} color={i === 0 ? COLORS.accentGold : COLORS.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{p.position}</div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? COLORS.accentGold : COLORS.textPrimary }}>{p.points}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>نقطة</div>
            </div>
          </div>
        ))}
  
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, margin: "20px 0 12px" }}>🎁 استبدال النقاط</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {rewards.map((r, i) => (
            <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${redeemed.includes(i) ? COLORS.accent : COLORS.border}`, borderRadius: 16, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>{r.name}</div>
              <div style={{ fontSize: 14, color: COLORS.accentGold, fontWeight: 800, marginBottom: 10 }}>⭐ {r.points}</div>
              <button
                onClick={() => !redeemed.includes(i) && userPoints >= r.points && setRedeemed(prev => [...prev, i])}
                style={{ width: "100%", padding: "8px", background: redeemed.includes(i) ? COLORS.accent : userPoints >= r.points ? `${COLORS.accent}22` : COLORS.surface, border: `1px solid ${userPoints >= r.points ? COLORS.accent : COLORS.border}`, color: redeemed.includes(i) ? "#000" : userPoints >= r.points ? COLORS.accent : COLORS.textSecondary, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {redeemed.includes(i) ? "✅ تم الاستبدال" : userPoints >= r.points ? "استبدل" : "نقاط غير كافية"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // ── صفحة المتجر ──
  function StorePage() {
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState("الكل");
    const [showCart, setShowCart] = useState(false);
    const cats = ["الكل", "ملابس", "إكسسوار", "حقائب", "معدات"];
    const filtered = category === "الكل" ? products : products.filter(p => p.category === category);
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary }}>🛒 المتجر</div>
          <button onClick={() => setShowCart(true)} style={{ background: COLORS.accent, color: "#000", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer" }}>🛒 {cart.length}</button>
        </div>
  
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "8px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
          ))}
        </div>
  
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map((p, i) => (
            <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 8, background: COLORS.surface, borderRadius: 12, padding: "12px" }}>{p.img}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 8 }}>{p.category}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: COLORS.accentGold, marginBottom: 10 }}>{p.price} <span style={{ fontSize: 11, fontWeight: 400 }}>ر.س</span></div>
              <button onClick={() => setCart(prev => [...prev, p])} style={{ width: "100%", padding: "9px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>أضف للسلة</button>
            </div>
          ))}
        </div>
  
        {showCart && (
          <Modal title="🛒 سلة المشتريات" onClose={() => setShowCart(false)}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: COLORS.textSecondary }}>السلة فارغة</div>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 24 }}>{item.img}</span>
                      <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{item.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: COLORS.accentGold, fontWeight: 700 }}>{item.price} ر.س</span>
                      <button onClick={() => setCart(prev => prev.filter((_, j) => j !== i))} style={{ background: COLORS.danger + "22", border: "none", color: COLORS.danger, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setCart([]); setShowCart(false); }} style={{ width: "100%", marginTop: 16, padding: "13px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>✓ إتمام الشراء</button>
              </>
            )}
          </Modal>
        )}
      </div>
    );
  }
  // ── صفحة الإشعارات ──
function NotificationsPage() {
    const [notifs, setNotifs] = useState([
      { id: 1, type: "match", msg: "مباراة غداً ضد أكاديمية النصر الساعة ١٠ صباحاً", time: "منذ ساعة", read: false },
      { id: 2, type: "absence", msg: "تم تسجيل غياب محمد العتيبي في تدريب أمس", time: "منذ ٣ ساعات", read: false },
      { id: 3, type: "payment", msg: "ينتهي اشتراكك خلال ٥ أيام - جدد الآن", time: "منذ يوم", read: true },
      { id: 4, type: "award", msg: "فهد الشمري حصل على ١٠٠ نقطة إضافية!", time: "منذ يومين", read: true },
    ]);
  
    const icons = { match: "⚽", absence: "❌", payment: "💳", award: "⭐" };
    const colors = { match: COLORS.warning, absence: COLORS.danger, payment: COLORS.accentBlue, award: COLORS.accentGold };
  
    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    const deleteNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary }}>🔔 الإشعارات</div>
          <button onClick={markAllRead} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>قراءة الكل</button>
        </div>
  
        {notifs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div>لا توجد إشعارات</div>
          </div>
        )}
  
        {notifs.map((n) => (
          <div key={n.id} style={{ background: n.read ? COLORS.cardBg : `${colors[n.type]}08`, border: `1px solid ${n.read ? COLORS.border : colors[n.type] + "33"}`, borderRight: `4px solid ${n.read ? COLORS.border : colors[n.type]}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${colors[n.type]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icons[n.type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.5 }}>{n.msg}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>{n.time}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[n.type] }} />}
              <button onClick={() => deleteNotif(n.id)} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 14 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // ── صفحة الاشتراكات ──
  function SubscriptionsPage() {
    const [signed, setSigned] = useState(false);
    const [selected, setSelected] = useState(null);
    const [step, setStep] = useState(1);
    const [payMethod, setPayMethod] = useState(null);
    const [done, setDone] = useState(false);
  
    if (done) return (
      <div style={{ padding: "40px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.accent, marginBottom: 8 }}>تم الاشتراك بنجاح!</div>
        <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>مرحباً بك في عضوية {memberships[selected]?.name}</div>
        <button onClick={() => { setDone(false); setStep(1); setSelected(null); setSigned(false); setPayMethod(null); }} style={{ padding: "12px 32px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>العودة للرئيسية</button>
      </div>
    );
  
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>الاشتراكات</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>اختر باقتك وأتمّ التسجيل</div>
  
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {["اختر الباقة", "العقد", "الدفع"].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, borderRadius: 2, background: step > i ? COLORS.accent : COLORS.border, marginBottom: 6 }} />
              <div style={{ fontSize: 11, color: step > i ? COLORS.accent : COLORS.textSecondary }}>{s}</div>
            </div>
          ))}
        </div>
  
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memberships.map((m, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ background: m.bg, border: `2px solid ${selected === i ? m.color : m.color + "33"}`, borderRadius: 16, padding: "18px", cursor: "pointer", boxShadow: selected === i ? `0 0 20px ${m.color}44` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: m.color, fontWeight: 800 }}>{m.name}</div>
                      <div style={{ color: COLORS.textSecondary, fontSize: 12 }}>{m.features.length} مزايا</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.textPrimary }}>{m.price}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>ر.س/شهر</div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => selected !== null && setStep(2)} style={{ padding: "14px", borderRadius: 14, background: selected !== null ? COLORS.accent : COLORS.surface, border: "none", color: selected !== null ? "#000" : COLORS.textSecondary, fontWeight: 800, fontSize: 15, cursor: selected !== null ? "pointer" : "not-allowed", marginTop: 8 }}>التالي: العقد ←</button>
          </div>
        )}
  
        {step === 2 && (
          <div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📄 عقد الاشتراك</div>
              {[
                "يلتزم المشترك بالحضور في المواعيد المحددة.",
                "يحق للأكاديمية إيقاف الاشتراك في حالة الإخلال بالنظام.",
                "لا يُسترد الاشتراك المدفوع إلا في حالات الإصابة الموثقة.",
                "يوافق المشترك على تصوير اللاعب لأغراض الأكاديمية.",
                "تسري هذه الشروط من تاريخ التوقيع على العقد.",
                "يلتزم ولي الأمر بالالتزام بأوقات الإحضار والاستلام.",
                "يحق للأكاديمية تعديل الجداول مع إشعار مسبق.",
              ].map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 16, borderRight: `2px solid ${COLORS.border}`, lineHeight: 1.6 }}>{c}</div>
              ))}
            </div>
            <div onClick={() => setSigned(!signed)} style={{ background: signed ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: signed ? COLORS.accent : COLORS.surface, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {signed && <span style={{ color: "#000", fontSize: 14, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textPrimary }}>أوافق على جميع الشروط والأحكام وأوقّع إلكترونياً</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>← رجوع</button>
              <button onClick={() => signed && setStep(3)} style={{ flex: 2, padding: "12px", borderRadius: 12, background: signed ? COLORS.accent : COLORS.surface, border: "none", color: signed ? "#000" : COLORS.textSecondary, fontWeight: 800, cursor: signed ? "pointer" : "not-allowed" }}>التالي: الدفع ←</button>
            </div>
          </div>
        )}
  
        {step === 3 && (
          <div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>ملخص الطلب</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: COLORS.textSecondary }}>الباقة</span>
                <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{memberships[selected]?.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: COLORS.textSecondary }}>المدة</span>
                <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>شهري</span>
              </div>
              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textPrimary, fontWeight: 800 }}>الإجمالي</span>
                  <span style={{ color: COLORS.accentGold, fontWeight: 900, fontSize: 20 }}>{memberships[selected]?.price} ر.س</span>
                </div>
              </div>
            </div>
  
            {[{ label: "مدى / Mada", icon: "💳" }, { label: "فيزا / Visa", icon: "💳" }, { label: "Apple Pay", icon: "🍎" }].map((m, i) => (
              <div key={i} onClick={() => setPayMethod(i)} style={{ background: payMethod === i ? `${COLORS.accent}15` : COLORS.cardBg, border: `1px solid ${payMethod === i ? COLORS.accent : COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, flex: 1 }}>{m.label}</div>
                {payMethod === i && <span style={{ color: COLORS.accent, fontWeight: 800 }}>✓</span>}
              </div>
            ))}
  
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>← رجوع</button>
              <button onClick={() => payMethod !== null && setDone(true)} style={{ flex: 2, padding: "14px", borderRadius: 14, background: payMethod !== null ? `linear-gradient(135deg, ${COLORS.accent}, #00a07a)` : COLORS.surface, border: "none", color: payMethod !== null ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 16, cursor: payMethod !== null ? "pointer" : "not-allowed" }}>✓ إتمام الدفع</button>
            </div>
          </div>
        )}
      </div>
    );
  }// ── لوحة تحكم المدير ──
function AdminPage() {
    const [adminTab, setAdminTab] = useState("overview");
    const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [actionTarget, setActionTarget] = useState(null);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("الكل");
    const [toast, setToast] = useState(null);
  
    const showToast = (msg, color = COLORS.accent) => {
      setToast({ msg, color });
      setTimeout(() => setToast(null), 2500);
    };
  
    const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal("add"); };
    const openEdit = (acc) => {
      setForm({ name: acc.name, role: acc.role, position: acc.position, age: String(acc.age), phone: acc.phone, membership: acc.membership, status: acc.status });
      setEditId(acc.id);
      setModal("edit");
    };
  
    const saveAccount = () => {
      if (!form.name.trim()) return;
      if (editId) {
        setAccounts(prev => prev.map(a => a.id === editId ? { ...a, ...form, age: Number(form.age) || a.age } : a));
        showToast("✅ تم تحديث الحساب");
      } else {
        setAccounts(prev => [...prev, { ...form, id: Date.now(), age: Number(form.age) || 0, attendance: 0, points: 0 }]);
        showToast("✅ تم إضافة الحساب");
      }
      setModal(null);
    };
  
    const toggleSuspend = (acc) => {
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, status: a.status === "موقوف" ? "نشط" : "موقوف" } : a));
      showToast(acc.status === "موقوف" ? "✅ تم تفعيل الحساب" : "⛔ تم إيقاف الحساب", acc.status === "موقوف" ? COLORS.accent : COLORS.danger);
      setModal(null);
    };
  
    const deleteAccount = (id) => {
      setAccounts(prev => prev.filter(a => a.id !== id));
      showToast("🗑️ تم حذف الحساب", COLORS.danger);
      setModal(null);
    };
  
    const filtered = accounts.filter(a => {
      const matchRole = filterRole === "الكل" || a.role === filterRole;
      const matchSearch = a.name.includes(search) || a.phone.includes(search);
      return matchRole && matchSearch;
    });
  
    const statusColor = s => s === "نشط" ? COLORS.accent : s === "موقوف" ? COLORS.danger : COLORS.warning;
  
    return (
      <div style={{ padding: "16px" }}>
        {toast && (
          <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#000", padding: "10px 24px", borderRadius: 20, fontWeight: 800, fontSize: 13, zIndex: 300, boxShadow: `0 4px 20px ${toast.color}55` }}>{toast.msg}</div>
        )}
  
        <div style={{ background: "linear-gradient(135deg, #1a0020, #2d003a)", border: "1px solid #a855f744", borderRadius: 16, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🔐</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#a855f7" }}>لوحة تحكم المدير</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>صلاحيات كاملة · {accounts.length} حساب</div>
          </div>
        </div>
  
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
          {[{ id: "overview", label: "نظرة عامة" }, { id: "accounts", label: "الحسابات" }, { id: "finance", label: "المالية" }, { id: "reports", label: "التقارير" }].map(t => (
            <button key={t.id} onClick={() => setAdminTab(t.id)} style={{ padding: "8px 16px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: adminTab === t.id ? "#a855f7" : COLORS.cardBg, border: `1px solid ${adminTab === t.id ? "#a855f7" : COLORS.border}`, color: adminTab === t.id ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>
  
        {adminTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <StatCard label="إجمالي الحسابات" value={String(accounts.length)} icon="👥" color="#a855f7" />
              <StatCard label="إيرادات الشهر" value="٧٢K" icon="💰" color={COLORS.accent} sub="ر.س" />
              <StatCard label="حسابات نشطة" value={String(accounts.filter(a => a.status === "نشط").length)} icon="✅" color={COLORS.accentBlue} />
              <StatCard label="موقوفة" value={String(accounts.filter(a => a.status === "موقوف").length)} icon="⛔" color={COLORS.danger} />
            </div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>📈 الإيرادات مقابل المصروفات</div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 120 }}>
                {financialData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 100 }}>
                      <div style={{ width: "45%", background: COLORS.accent, height: `${(d.revenue / 80000) * 100}%`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                      <div style={{ width: "45%", background: COLORS.danger + "88", height: `${(d.expenses / 80000) * 100}%`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                    </div>
                    <div style={{ fontSize: 9, color: COLORS.textSecondary }}>{d.month.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: COLORS.accent, borderRadius: 2 }} /><span style={{ fontSize: 11, color: COLORS.textSecondary }}>إيرادات</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: COLORS.danger + "88", borderRadius: 2 }} /><span style={{ fontSize: 11, color: COLORS.textSecondary }}>مصروفات</span></div>
              </div>
            </div>
          </div>
        )}
  
        {adminTab === "accounts" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={openAdd} style={{ padding: "11px 18px", borderRadius: 12, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>+ إضافة</button>
              <input placeholder="بحث بالاسم أو الجوال..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 12, padding: "10px 14px", fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
              {["الكل", "لاعب", "مدرب", "ولي أمر", "مدير"].map(r => (
                <button key={r} onClick={() => setFilterRole(r)} style={{ padding: "6px 14px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: filterRole === r ? "#a855f7" : COLORS.cardBg, border: `1px solid ${filterRole === r ? "#a855f7" : COLORS.border}`, color: filterRole === r ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{r}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 }}>{filtered.length} حساب</div>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textSecondary }}>لا توجد نتائج</div>}
            {filtered.map(acc => (
              <div key={acc.id} style={{ background: COLORS.cardBg, border: `1px solid ${acc.status === "موقوف" ? COLORS.danger + "33" : COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, opacity: acc.status === "موقوف" ? 0.7 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar letter={acc.name[0]} size={42} color={acc.role === "مدرب" ? COLORS.accentGold : acc.role === "ولي أمر" ? COLORS.accentBlue : COLORS.accent} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{acc.name}</span>
                      <Badge text={acc.status} color={statusColor(acc.status)} />
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{acc.role} {acc.position !== "-" ? `· ${acc.position}` : ""} · {acc.phone}</div>
                    {acc.membership !== "-" && <div style={{ fontSize: 11, color: COLORS.accentGold, marginTop: 2 }}>عضوية {acc.membership}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button onClick={() => openEdit(acc)} style={{ flex: 1, padding: "8px", borderRadius: 9, background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>
                  <button onClick={() => { setActionTarget(acc); setModal("confirm-suspend"); }} style={{ flex: 1, padding: "8px", borderRadius: 9, background: acc.status === "موقوف" ? COLORS.accent + "22" : COLORS.warning + "22", border: `1px solid ${acc.status === "موقوف" ? COLORS.accent + "44" : COLORS.warning + "44"}`, color: acc.status === "موقوف" ? COLORS.accent : COLORS.warning, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{acc.status === "موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
                  <button onClick={() => { setActionTarget(acc); setModal("confirm-delete"); }} style={{ padding: "8px 12px", borderRadius: 9, background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {adminTab === "finance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accounts.filter(a => a.role === "لاعب").map((acc, i) => {
              const statuses = ["مدفوع", "متأخر", "مدفوع", "معلق", "مدفوع"];
              const amounts = ["٤٥٠", "٤٥٠", "٦٥٠", "٢٥٠", "٩٥٠"];
              const dates = ["١ يونيو", "منذ ١٥ يوم", "٣ يونيو", "قيد المراجعة", "٢ يونيو"];
              const s = statuses[i % statuses.length];
              const c = s === "مدفوع" ? COLORS.accent : s === "متأخر" ? COLORS.danger : COLORS.warning;
              return (
                <div key={acc.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{dates[i % dates.length]}</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>{amounts[i % amounts.length]} ر.س</div>
                    <Badge text={s} color={c} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
  
        {adminTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { title: "نسبة حضور المدربين", value: "٩٤٪", icon: "👨‍🏫", color: COLORS.accent },
              { title: "تقييم جودة التدريب", value: "٤.٧/٥", icon: "⭐", color: COLORS.accentGold },
              { title: "نمو الاشتراكات", value: "+١٢٪", icon: "📈", color: COLORS.accentBlue },
              { title: "رضا أولياء الأمور", value: "٩١٪", icon: "👨‍👦", color: "#a855f7" },
            ].map((r, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{r.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: COLORS.textSecondary }}>{r.title}</div></div>
                <div style={{ fontSize: 22, fontWeight: 900, color: r.color }}>{r.value}</div>
              </div>
            ))}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>أداء المدربين</div>
              {accounts.filter(a => a.role === "مدرب").map((t, i) => {
                const ratings = [4.9, 4.7, 4.5];
                const sessions = [24, 22, 20];
                const r = ratings[i] || 4.3;
                return (
                  <div key={t.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{t.name}</span>
                      <span style={{ fontSize: 13, color: COLORS.accentGold, fontWeight: 700 }}>⭐ {r}</span>
                    </div>
                    <MiniBar percent={(r / 5) * 100} color={COLORS.accentGold} />
                    <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{sessions[i] || 18} جلسة هذا الشهر</div>
                  </div>
                );
              })}
              {accounts.filter(a => a.role === "مدرب").length === 0 && <div style={{ color: COLORS.textSecondary, fontSize: 13 }}>لا يوجد مدربون مضافون</div>}
            </div>
          </div>
        )}
  
        {(modal === "add" || modal === "edit") && (
          <Modal title={modal === "add" ? "➕ إضافة حساب" : "✏️ تعديل الحساب"} onClose={() => setModal(null)}>
            <Field label="الاسم الكامل" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Field label="نوع الحساب" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={["لاعب", "مدرب", "ولي أمر", "مدير"]} />
            {form.role === "لاعب" && <Field label="المركز" value={form.position} onChange={v => setForm(f => ({ ...f, position: v }))} options={["مهاجم", "وسط", "دفاع", "حارس"]} />}
            <Field label="العمر" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} type="number" />
            <Field label="رقم الجوال" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            {form.role === "لاعب" && <Field label="العضوية" value={form.membership} onChange={v => setForm(f => ({ ...f, membership: v }))} options={["برونزي", "فضي", "ذهبي", "ماسي"]} />}
            <Field label="الحالة" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={["نشط", "موقوف", "معلق"]} />
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
              <button onClick={saveAccount} disabled={!form.name.trim()} style={{ flex: 2, padding: "12px", borderRadius: 12, background: form.name.trim() ? COLORS.accent : COLORS.surface, border: "none", color: form.name.trim() ? "#000" : COLORS.textSecondary, fontWeight: 800, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>{modal === "add" ? "✅ إضافة" : "✅ حفظ"}</button>
            </div>
          </Modal>
        )}
  
        {modal === "confirm-suspend" && actionTarget && (
          <Modal title="تأكيد" onClose={() => setModal(null)}>
            <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.7 }}>{actionTarget.status === "موقوف" ? `هل تريد تفعيل "${actionTarget.name}"؟` : `هل تريد إيقاف "${actionTarget.name}"؟`}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
              <button onClick={() => toggleSuspend(actionTarget)} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: actionTarget.status === "موقوف" ? COLORS.accent : COLORS.warning, color: "#000", fontWeight: 800, cursor: "pointer" }}>{actionTarget.status === "موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
            </div>
          </Modal>
        )}
  
        {modal === "confirm-delete" && actionTarget && (
          <Modal title="⚠️ حذف الحساب" onClose={() => setModal(null)}>
            <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.7 }}>سيتم حذف <strong style={{ color: COLORS.textPrimary }}>"{actionTarget.name}"</strong> نهائياً.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
              <button onClick={() => deleteAccount(actionTarget.id)} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: COLORS.danger, color: "#fff", fontWeight: 800, cursor: "pointer" }}>🗑️ حذف نهائياً</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }
  
  // ── التطبيق الرئيسي ──
  const tabs = [
    { id: "home", icon: "🏠", label: "الرئيسية" },
    { id: "schedule", icon: "📅", label: "الجداول" },
    { id: "tournaments", icon: "🏆", label: "البطولات" },
    { id: "rewards", icon: "⭐", label: "المكافآت" },
    { id: "store", icon: "🛒", label: "المتجر" },
    { id: "profile", icon: "👤", label: "الملف" },
    { id: "notifications", icon: "🔔", label: "الإشعارات" },
    { id: "subscriptions", icon: "💳", label: "الاشتراك" },
    { id: "admin", icon: "🔐", label: "الإدارة" },
  ];
  
  export default function App() {
    const [active, setActive] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const visibleTabs = tabs.slice(0, 5);
  
    const renderPage = () => {
      switch (active) {
        case "home": return <HomePage onNav={setActive} />;
        case "profile": return <ProfilePage />;
        case "schedule": return <SchedulePage />;
        case "rewards": return <RewardsPage />;
        case "tournaments": return <TournamentsPage />;
        case "store": return <StorePage />;
        case "admin": return <AdminPage />;
        case "notifications": return <NotificationsPage />;
        case "subscriptions": return <SubscriptionsPage />;
        default: return <HomePage onNav={setActive} />;
      }
    };
  
    return (
      <div style={{ minHeight: "100vh", background: COLORS.darkBg, fontFamily: "'Cairo', sans-serif", direction: "rtl", color: COLORS.textPrimary, maxWidth: 430, margin: "0 auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  
        <div style={{ background: COLORS.cardBg, borderBottom: `1px solid ${COLORS.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #00c896, #0066cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚽</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>أكاديمية النجوم</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => { setActive("notifications"); setMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>🔔</button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>القائمة</button>
          </div>
        </div>
  
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 90 }} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 240, background: COLORS.cardBg, borderLeft: `1px solid ${COLORS.border}`, zIndex: 100, padding: "60px 0 20px" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setActive(t.id); setMenuOpen(false); }} style={{ width: "100%", padding: "14px 20px", background: active === t.id ? `${COLORS.accent}15` : "none", border: "none", borderRight: `3px solid ${active === t.id ? COLORS.accent : "transparent"}`, color: active === t.id ? COLORS.accent : COLORS.textSecondary, display: "flex", alignItems: "center", gap: 12, fontWeight: active === t.id ? 800 : 400, fontSize: 14, cursor: "pointer" }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </>
        )}
  
        <div style={{ paddingBottom: 80 }}>{renderPage()}</div>
  
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: COLORS.cardBg, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 50 }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{ flex: 1, padding: "10px 4px", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: active === t.id ? COLORS.accent : COLORS.textSecondary }}>{t.label}</span>
              {active === t.id && <div style={{ width: 20, height: 2, background: COLORS.accent, borderRadius: 1 }} />}
            </button>
          ))}
        </div>
      </div>
    );
  }