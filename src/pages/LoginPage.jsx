import { useState } from "react";
import { signIn } from "../lib/auth";
import { COLORS } from "../constants/colors";
import { BRAND } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { Logo } from "../components/Logo";

export function LoginPage({ onLogin, logoUrl }) {
  const [idNum, setIdNum] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useWindowSize();

  const handleLogin = async () => {
    setError(""); setLoading(true);
    const { user, error: err } = await signIn(idNum, pass);
    if (err) { setError(err); setLoading(false); return; }
    onLogin(user);
    setLoading(false);
  };

  const features = BRAND.features;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.darkBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Cairo',sans-serif", direction: "rtl" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", gap: 48, alignItems: "center", width: "100%", maxWidth: isDesktop ? 920 : 400 }}>

        {isDesktop && (
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ margin: "0 auto 20px", filter: "drop-shadow(0 0 40px #1fc7c766)" }}><Logo size={110} src={logoUrl} /></div>
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.textPrimary, marginBottom: 6 }}>{BRAND.name}</div>
            <div style={{ fontSize: 13, color: COLORS.accent, letterSpacing: 3, marginBottom: 28 }}>{BRAND.tagline}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {features.map(([icon, title, sub], i) => (
                <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 26 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 6 }}>{title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ width: isDesktop ? 370 : "100%" }}>
          {!isDesktop && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ margin: "0 auto 10px" }}><Logo size={76} src={logoUrl} /></div>
              <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.textPrimary }}>{BRAND.name}</div>
            </div>
          )}

          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 26 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 3 }}>تسجيل الدخول</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 22 }}>أدخل رقم العضوية وكلمة السر</div>

            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 5, fontWeight: 600 }}>رقم العضوية</div>
              <input value={idNum} onChange={e => setIdNum(e.target.value)} placeholder="أدخل رقم العضوية"
                onKeyDown={e => e.key === "Enter" && idNum && pass && handleLogin()}
                style={{ width: "100%", background: COLORS.surface, border: `1px solid ${error ? COLORS.danger : COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "11px 14px", fontSize: 14, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 5, fontWeight: 600 }}>كلمة السر</div>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && idNum && pass && handleLogin()} placeholder="••••••••"
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${error ? COLORS.danger : COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "11px 14px", fontSize: 14, boxSizing: "border-box" }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 15 }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {error && (
              <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}33`, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: COLORS.danger, marginBottom: 14 }}>⚠️ {error}</div>
            )}

            <button onClick={handleLogin} disabled={loading || !idNum || !pass}
              style={{ width: "100%", padding: "13px", borderRadius: 13, background: idNum && pass && !loading ? `linear-gradient(135deg,${COLORS.accent},#00a07a)` : COLORS.surface, border: "none", color: idNum && pass && !loading ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: idNum && pass && !loading ? "pointer" : "not-allowed" }}>
              {loading ? "جاري الدخول..." : "دخول ←"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: COLORS.textSecondary }}>
            للحصول على حساب، تواصل مع إدارة الأكاديمية
          </div>
        </div>
      </div>
    </div>
  );
}
