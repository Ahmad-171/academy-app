import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { ATT_PREFIX } from "../components/QRCodeImage";

const READER_ID = "att-qr-reader";
const today = () => new Date().toISOString().slice(0, 10);

// نافذة مسح باركود الحضور بالكاميرا. أول مسح للاعب = تسجيل حضور،
// والمسح الثاني بنفس اليوم = تسجيل انصراف.
export function ScanAttendance({ players, onClose, onRecorded }) {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { name, action }
  const scannerRef = useRef(null);
  const lastRef = useRef({ id: null, at: 0 });
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
    const id = decoded.startsWith(ATT_PREFIX) ? decoded.slice(ATT_PREFIX.length).trim() : decoded.trim();
    // تجاهل نفس الباركود إذا تكرر خلال ٣ ثوان أو أثناء المعالجة
    const now = Date.now();
    if (busyRef.current || (lastRef.current.id === id && now - lastRef.current.at < 3000)) return;
    busyRef.current = true;
    lastRef.current = { id, at: now };

    const player = players.find(p => p.id === id);
    if (!player) { setError(`باركود غير معروف: ${id}`); busyRef.current = false; return; }

    setError("");
    const { data: row } = await supabase.from('attendance_log').select('*').eq('user_id', id).eq('day', today()).maybeSingle();
    const nowIso = new Date().toISOString();
    let action;
    if (!row || !row.check_in) {
      await supabase.from('attendance_log').upsert({ user_id: id, day: today(), check_in: nowIso }, { onConflict: 'user_id,day' });
      action = "حضور";
    } else if (!row.check_out) {
      await supabase.from('attendance_log').update({ check_out: nowIso }).eq('user_id', id).eq('day', today());
      action = "انصراف";
    } else {
      action = "مسجّل مسبقًا";
    }
    setResult({ name: player.name, action });
    onRecorded?.();
    setTimeout(() => { busyRef.current = false; }, 1500);
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
          <div style={{ background: COLORS.accent + "15", border: `1px solid ${COLORS.accent}44`, borderRadius: 10, padding: "12px 14px", marginTop: 14, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.accent }}>✅ {result.name}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>تم تسجيل {result.action}</div>
          </div>
        )}

        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 14, textAlign: "center", lineHeight: 1.7 }}>
          وجّه الكاميرا نحو باركود اللاعب. أول مسح = حضور، والمسح التالي بنفس اليوم = انصراف. تبقى الكاميرا مفتوحة للمسح المتتالي.
        </div>
      </div>
    </>
  );
}
