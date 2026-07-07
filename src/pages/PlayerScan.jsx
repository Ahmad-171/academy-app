import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { COLORS } from "../constants/colors";
import { ATT_PREFIX } from "../components/QRCodeImage";
import { readDailyToken, recordAttendance, todayStr } from "../lib/attendance";

const READER_ID = "player-att-reader";
const ACTION_LABEL = { IN: "حضور", OUT: "انصراف" };

// كاميرا اللاعب لمسح باركود الحضور اليومي المعروض من المدير.
// يتحقق من التاريخ والتوكن ثم يسجّل حضور/انصراف اللاعب لنفسه.
export function PlayerScan({ player, onClose, onRecorded }) {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { message, ok }
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

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
      if (!decoded.startsWith(ATT_PREFIX)) {
        setError("هذا الباركود غير خاص بالحضور");
        return;
      }
      const [action, date, token] = decoded.slice(ATT_PREFIX.length).split(":");
      if (date !== todayStr()) {
        setError("باركود منتهٍ — اطلب من المدرب باركود اليوم");
        return;
      }
      const daily = await readDailyToken();
      if (!daily || daily.date !== todayStr() || daily.token !== token) {
        setError("باركود غير صالح — اطلب من المدرب باركود اليوم");
        return;
      }
      setError("");
      const res = await recordAttendance(player.id, action);
      setResult({ ok: res.ok, message: res.message, action });
      if (res.ok) onRecorded?.();
    } finally {
      setTimeout(() => { busyRef.current = false; }, 2500);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 22, width: "min(94vw,420px)", zIndex: 201 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>📷 مسح باركود الحضور</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div id={READER_ID} style={{ width: "100%", borderRadius: 12, overflow: "hidden", background: "#000", minHeight: 240 }} />

        {error && (
          <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}33`, borderRadius: 10, padding: "10px 13px", fontSize: 13, color: COLORS.danger, marginTop: 14 }}>⚠️ {error}</div>
        )}
        {result && (
          <div style={{ background: (result.ok ? COLORS.accent : COLORS.warning) + "15", border: `1px solid ${(result.ok ? COLORS.accent : COLORS.warning)}44`, borderRadius: 10, padding: "12px 14px", marginTop: 14, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: result.ok ? COLORS.accent : COLORS.warning }}>{result.ok ? "✅" : "ℹ️"} {result.message}</div>
            {result.ok && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{ACTION_LABEL[result.action] || ""} · {new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>}
          </div>
        )}

        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 14, textAlign: "center", lineHeight: 1.7 }}>
          وجّه الكاميرا نحو باركود «حضور» عند وصولك، و«انصراف» عند مغادرتك — المعروض لدى المدرب.
        </div>
      </div>
    </>
  );
}
