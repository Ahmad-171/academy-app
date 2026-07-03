import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { Badge } from "../components/ui";

export function LoginPage({ onLogin, users }) {
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
