import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Avatar, Badge, ToastMsg } from "../components/ui";

const today = () => new Date().toISOString().slice(0, 10);

export function AttendanceManager({ users }) {
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const people = users.filter(u => u.role === "لاعب" || u.role === "مدرب");

  const loadLogs = useCallback(async (userId) => {
    setLoading(true);
    const { data } = await supabase.from('attendance_log').select('*').eq('user_id', userId).order('day', { ascending: false }).limit(14);
    setLogs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (selected) loadLogs(selected.id); }, [selected, loadLogs]);

  const todayRow = logs.find(l => l.day === today());

  const checkIn = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('attendance_log').upsert(
      { user_id: selected.id, day: today(), check_in: now },
      { onConflict: 'user_id,day' }
    );
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    show("✅ تم تسجيل الحضور");
    loadLogs(selected.id);
  };

  const checkOut = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('attendance_log').update({ check_out: now }).eq('user_id', selected.id).eq('day', today());
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    show("✅ تم تسجيل الانصراف");
    loadLogs(selected.id);
  };

  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>اختر شخصًا</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: isDesktop ? 0 : 16 }}>
            {people.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{ background: selected?.id === p.id ? `${COLORS.accent}18` : COLORS.cardBg, border: `1px solid ${selected?.id === p.id ? COLORS.accent : COLORS.border}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar letter={p.name[0]} size={32} color={p.role === "مدرب" ? COLORS.accentGold : COLORS.accent} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.textSecondary }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>حضور اليوم — {selected.name}</div>
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ flex: 1, background: COLORS.surface, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>وقت الحضور</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.accent }}>{fmt(todayRow?.check_in)}</div>
                </div>
                <div style={{ flex: 1, background: COLORS.surface, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>وقت الانصراف</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.warning }}>{fmt(todayRow?.check_out)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={checkIn} disabled={!!todayRow?.check_in} style={{ flex: 1, padding: "10px", background: todayRow?.check_in ? COLORS.surface : COLORS.accent, border: "none", color: todayRow?.check_in ? COLORS.textSecondary : "#000", borderRadius: 10, fontWeight: 800, cursor: todayRow?.check_in ? "default" : "pointer" }}>✅ تسجيل حضور</button>
                <button onClick={checkOut} disabled={!todayRow?.check_in || !!todayRow?.check_out} style={{ flex: 1, padding: "10px", background: (!todayRow?.check_in || todayRow?.check_out) ? COLORS.surface : COLORS.warning, border: "none", color: (!todayRow?.check_in || todayRow?.check_out) ? COLORS.textSecondary : "#000", borderRadius: 10, fontWeight: 800, cursor: (!todayRow?.check_in || todayRow?.check_out) ? "default" : "pointer" }}>🚪 تسجيل انصراف</button>
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>سجل آخر 14 يوم</div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: 20, textAlign: "center", color: COLORS.textSecondary }}>جاري التحميل...</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: COLORS.textSecondary }}>لا يوجد سجل بعد</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: COLORS.surface }}>
                      <th style={{ padding: "9px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center" }}>اليوم</th>
                      <th style={{ padding: "9px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center" }}>الحضور</th>
                      <th style={{ padding: "9px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center" }}>الانصراف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "9px", textAlign: "center", fontSize: 12, color: COLORS.textPrimary }}>{l.day}</td>
                        <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmt(l.check_in)} color={l.check_in ? COLORS.accent : COLORS.textSecondary} /></td>
                        <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmt(l.check_out)} color={l.check_out ? COLORS.warning : COLORS.textSecondary} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "50px", textAlign: "center", color: COLORS.textSecondary }}>
            اختر شخصًا من القائمة لعرض سجل حضوره
          </div>
        )}
      </div>
    </div>
  );
}
