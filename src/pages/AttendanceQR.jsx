import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { QRCodeImage, dailyAttValue } from "../components/QRCodeImage";
import { getOrCreateDailyToken, rotateDailyToken, ATT_ACTIONS } from "../lib/attendance";

// شاشة عرض باركود الحضور اليومي — يعرضها المدير أو صاحب الصلاحية،
// واللاعبون يمسحونها بكاميراتهم. باركود للحضور وآخر للانصراف، يتجدّد كل يوم.
export function AttendanceQR({ onClose }) {
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { setDaily(await getOrCreateDailyToken()); setLoading(false); })();
  }, []);

  const rotate = async () => {
    setLoading(true);
    setDaily(await rotateDailyToken());
    setLoading(false);
  };

  const cards = daily ? [
    { action: ATT_ACTIONS.IN,  label: "حضور",   emoji: "✅", color: COLORS.accent },
    { action: ATT_ACTIONS.OUT, label: "انصراف", emoji: "🚪", color: COLORS.warning },
  ] : [];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 22, width: "min(94vw,440px)", maxHeight: "90vh", overflowY: "auto", zIndex: 201 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>🎫 باركود حضور اليوم</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 18, lineHeight: 1.7 }}>
          اعرض هذا الباركود للاعبين ليمسحوه بكاميراتهم من صفحة «ملفي». يتجدّد الباركود تلقائيًا كل يوم.
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.textSecondary }}>جاري التحميل...</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {cards.map(c => (
                <div key={c.action} style={{ flex: "1 1 160px", minWidth: 150, background: COLORS.surface, border: `1px solid ${c.color}55`, borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.color, marginBottom: 12 }}>{c.emoji} {c.label}</div>
                  <div style={{ background: "#fff", padding: 10, borderRadius: 12, display: "inline-block" }}>
                    <QRCodeImage value={dailyAttValue(c.action, daily.date, daily.token)} size={150} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, background: COLORS.surface, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>تاريخ اليوم: <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{daily.date}</span></div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>الرمز: <span style={{ color: COLORS.accent, fontWeight: 800, letterSpacing: 1 }}>{daily.token}</span></div>
            </div>

            <button onClick={rotate} style={{ width: "100%", marginTop: 14, padding: "11px", background: COLORS.purple + "22", border: `1px solid ${COLORS.purple}55`, color: COLORS.purple, borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              🔄 توليد باركود جديد
            </button>
          </>
        )}
      </div>
    </>
  );
}
