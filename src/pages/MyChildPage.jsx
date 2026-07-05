import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { Avatar, Badge, MiniBar } from "../components/ui";

const CRITERIA = [
  { label: "السرعة",         key: "speed",    color: COLORS.accent },
  { label: "التمرير",        key: "passing",  color: COLORS.accentBlue },
  { label: "التسديد",        key: "shooting", color: COLORS.warning },
  { label: "الدفاع",         key: "defense",  color: COLORS.purple },
  { label: "الروح الرياضية", key: "spirit",   color: COLORS.accentGold },
];

const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";

export function MyChildPage({ user, users }) {
  const [evaluations, setEvaluations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDesktop } = useWindowSize();

  const child = users.find(u => u.id === user.childId);

  useEffect(() => {
    if (!child) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [evalsRes, attRes] = await Promise.all([
        supabase.from('evaluations').select('*').eq('user_id', child.id).order('eval_date', { ascending: false }).limit(10),
        supabase.from('attendance_log').select('*').eq('user_id', child.id).order('day', { ascending: false }).limit(21),
      ]);
      setEvaluations(evalsRes.data || []);
      setAttendance(attRes.data || []);
      setLoading(false);
    })();
  }, [child]);

  if (!child) return (
    <div style={{ padding: "60px 24px", textAlign: "center", color: COLORS.textSecondary }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👦</div>
      <div>لا يوجد لاعب مرتبط بحسابك — تواصل مع الإدارة لربط ملف ولدك</div>
    </div>
  );

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>👨‍👦 ملف ولدي</div>

      {/* بطاقة الابن */}
      <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar letter={child.name[0]} size={52} color={COLORS.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{child.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{child.position !== "-" ? `${child.position} · ` : ""}{child.category || ""}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <Badge text={child.status || "نشط"} color={child.status === "موقوف" ? COLORS.danger : COLORS.accent} />
            {child.subscription_end && <Badge text={`الاشتراك حتى ${child.subscription_end}`} color={COLORS.accentGold} />}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: COLORS.textSecondary }}>جاري التحميل...</div>
      ) : (
        <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* التقييمات */}
          <div style={{ marginBottom: isDesktop ? 0 : 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>⭐ التقييم الحالي</div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              {CRITERIA.map(c => (
                <div key={c.key} style={{ marginBottom: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: COLORS.textSecondary }}>{c.label}</span>
                    <span style={{ color: c.color, fontWeight: 700 }}>{child.ratings?.[c.key] || 0}٪</span>
                  </div>
                  <MiniBar percent={child.ratings?.[c.key] || 0} color={c.color} />
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
      )}
    </div>
  );
}
