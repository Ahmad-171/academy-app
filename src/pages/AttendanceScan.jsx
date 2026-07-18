import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { COLORS } from "../constants/colors";
import { PLAYER_PREFIX } from "../components/QRCodeImage";
import { recordAttendance, ATT_ACTIONS } from "../lib/attendance";

const READER_ID = "admin-att-reader";

// كاميرا المدرب/الإداري لمسح رمز اللاعب المعروض على جواله.
// يختار الإداري الوضع (حضور/انصراف) ثم يمسح رمز كل لاعب فيُسجَّل له.
export function AttendanceScan({ users = [], onClose, onRecorded }) {
  const [action, setAction] = useState(ATT_ACTIONS.IN);
  const [error, setError] = useState("");
  const [last, setLast] = useState(null); // { ok, message, name }
  const scannerRef = useRef(null);
  const busyRef = useRef(false);
  const actionRef = useRef(action);
  useEffect(() => { actionRef.current = action; }, [action]);

  useEffect(() => {
    const scanner = new Html5Qrcode(READER_ID);
    scannerRef.current = scanner;
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 230 },
      handleScan,
      () => {}
    ).catch(() => setError("تعذّر تشغيل الكاميرا — تأكد من منح الإذن، والموقع يعمل عبر HTTPS."));
    return () => {
      const s = scannerRef.current;
      if (s) s.stop().then(() => s.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (decoded) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (!decoded.startsWith(PLAYER_PREFIX)) {
        setError("هذا الرمز ليس رمز حضور لاعب");
        return;
      }
      const id = decoded.slice(PLAYER_PREFIX.length);
      const person = users.find(u => u.id === id);
      setError("");
      const res = await recordAttendance(id, actionRef.current);
      setLast({ ok: res.ok, message: res.message, name: person?.name || id, action: actionRef.current });
      if (res.ok) onRecorded?.();
    } finally {
      setTimeout(() => { busyRef.current = false; }, 2000);
    }
  };

  const TABS = [
    { a: ATT_ACTIONS.IN, label: "حضور", emoji: "✅", color: COLORS.accent },
    { a: ATT_ACTIONS.OUT, label: "انصراف", emoji: "🚪", color: COLORS.warning },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 22, width: "min(94vw,420px)", maxHeight: "92vh", overflowY: "auto", zIndex: 201 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>📷 مسح حضور اللاعبين</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* اختيار الوضع: حضور أو انصراف */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {TABS.map(t => (
            <button key={t.a} onClick={() => setAction(t.a)} style={{
              flex: 1, padding: "11px", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer",
              background: action === t.a ? t.color : COLORS.surface,
              border: `1px solid ${action === t.a ? t.color : COLORS.border}`,
              color: action === t.a ? "#000" : COLORS.textSecondary,
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>

        <div id={READER_ID} style={{ width: "100%", borderRadius: 12, overflow: "hidden", background: "#000", minHeight: 240 }} />

        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 12, textAlign: "center" }}>
          وجّه الكاميرا نحو رمز اللاعب المعروض على جواله. الوضع الحالي: <span style={{ color: action === ATT_ACTIONS.IN ? COLORS.accent : COLORS.warning, fontWeight: 800 }}>{action === ATT_ACTIONS.IN ? "حضور" : "انصراف"}</span>
        </div>

        {error && (
          <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}33`, borderRadius: 10, padding: "10px 13px", fontSize: 13, color: COLORS.danger, marginTop: 12 }}>⚠️ {error}</div>
        )}
        {last && (
          <div style={{ background: (last.ok ? COLORS.accent : COLORS.warning) + "15", border: `1px solid ${(last.ok ? COLORS.accent : COLORS.warning)}44`, borderRadius: 10, padding: "12px 14px", marginTop: 12, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: last.ok ? COLORS.accent : COLORS.warning }}>{last.ok ? "✅" : "ℹ️"} {last.name}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{last.message}</div>
          </div>
        )}
      </div>
    </>
  );
}
