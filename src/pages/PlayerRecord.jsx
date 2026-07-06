import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { Avatar, Badge, MiniBar } from "../components/ui";
import { QRCodeImage, attendanceToken } from "../components/QRCodeImage";

const CRITERIA = [
  { label: "السرعة",         key: "speed",    color: COLORS.accent },
  { label: "التمرير",        key: "passing",  color: COLORS.accentBlue },
  { label: "التسديد",        key: "shooting", color: COLORS.warning },
  { label: "الدفاع",         key: "defense",  color: COLORS.purple },
  { label: "الروح الرياضية", key: "spirit",   color: COLORS.accentGold },
];

const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";

// عرض للقراءة فقط لسجل اللاعب: بياناته، الملاحظات، التقييمات، الحضور.
// يستخدمه اللاعب لنفسه وولي الأمر لولده.
export function PlayerRecord({ player, title }) {
  const [notes, setNotes] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDesktop } = useWindowSize();

  useEffect(() => {
    if (!player) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [notesRes, evalsRes, attRes] = await Promise.all([
        supabase.from('player_notes').select('*').eq('user_id', player.id).order('created_at', { ascending: false }),
        supabase.from('evaluations').select('*').eq('user_id', player.id).order('eval_date', { ascending: false }).limit(10),
        supabase.from('attendance_log').select('*').eq('user_id', player.id).order('day', { ascending: false }).limit(21),
      ]);
      setNotes(notesRes.data || []);
      setEvaluations(evalsRes.data || []);
      setAttendance(attRes.data || []);
      setLoading(false);
    })();
  }, [player]);

  if (!player) return null;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>{title}</div>

      {/* بطاقة اللاعب */}
      <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar letter={player.name[0]} size={52} color={COLORS.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{player.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{player.position !== "-" ? `${player.position} · ` : ""}{player.category || ""}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <Badge text={player.status || "نشط"} color={player.status === "موقوف" ? COLORS.danger : COLORS.accent} />
            {player.subscription_end && <Badge text={`الاشتراك حتى ${player.subscription_end}`} color={COLORS.accentGold} />}
          </div>
        </div>
      </div>

      {/* باركود الحضور */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ background: "#fff", padding: 10, borderRadius: 12 }}>
          <QRCodeImage value={attendanceToken(player.id)} size={isDesktop ? 150 : 120} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 6 }}>📲 باركود الحضور</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.7 }}>
            اعرض هذا الباركود للمدرب عند الوصول ليُسجّل حضورك تلقائيًا بمسحه بالكاميرا.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: COLORS.textSecondary }}>جاري التحميل...</div>
      ) : (
        <>
          {/* الملاحظات */}
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📝 ملاحظات المدربين</div>
          {notes.length === 0 ? (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, textAlign: "center", color: COLORS.textSecondary, fontSize: 13, marginBottom: 22 }}>لا توجد ملاحظات بعد</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 12, marginBottom: 22 }}>
              {notes.map(n => (
                <div key={n.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.accent}33`, borderRight: `4px solid ${COLORS.accent}`, borderRadius: 13, padding: "13px 16px" }}>
                  <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 6 }}>{new Date(n.created_at).toLocaleDateString("ar-SA")}</div>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.7 }}>{n.note}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* التقييمات */}
            <div style={{ marginBottom: isDesktop ? 0 : 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>⭐ التقييم الحالي</div>
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                {CRITERIA.map(c => (
                  <div key={c.key} style={{ marginBottom: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: COLORS.textSecondary }}>{c.label}</span>
                      <span style={{ color: c.color, fontWeight: 700 }}>{player.ratings?.[c.key] || 0}٪</span>
                    </div>
                    <MiniBar percent={player.ratings?.[c.key] || 0} color={c.color} />
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>📋 سجل التقييمات</div>
              {evaluations.length === 0 ? (
                <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد تقييمات بعد</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {evaluations.map(h => (
                    <div key={h.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 6 }}>{h.eval_date}</div>
                      {h.note && <div style={{ fontSize: 12, color: COLORS.textPrimary, marginBottom: 6, lineHeight: 1.6 }}>{h.note}</div>}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {CRITERIA.map(c => (
                          <span key={c.key} style={{ fontSize: 11, color: c.color }}>{c.label}: {h.ratings?.[c.key] ?? 0}٪</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الحضور والانصراف */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>🕒 الحضور والانصراف — آخر 21 يوم</div>
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
                {attendance.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا يوجد سجل حضور بعد</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: COLORS.surface }}>
                        {["اليوم", "الحضور", "الانصراف"].map((h, i) => (
                          <th key={i} style={{ padding: "10px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map(l => (
                        <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.textPrimary }}>{l.day}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}><Badge text={fmtTime(l.check_in)} color={l.check_in ? COLORS.accent : COLORS.textSecondary} /></td>
                          <td style={{ padding: "10px", textAlign: "center" }}><Badge text={fmtTime(l.check_out)} color={l.check_out ? COLORS.warning : COLORS.textSecondary} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
