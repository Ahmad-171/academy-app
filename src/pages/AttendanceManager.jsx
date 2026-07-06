import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Avatar, Badge, Modal, ToastMsg } from "../components/ui";
import { ScanAttendance } from "./ScanAttendance";

const today = () => new Date().toISOString().slice(0, 10);
const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";
const toTimeInput = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
// يحول يوم + وقت (HH:MM) إلى timestamp كامل بتوقيت المتصفح المحلي
const toTimestamp = (day, time) => time ? new Date(`${day}T${time}:00`).toISOString() : null;

export function AttendanceManager({ users, canEdit = true }) {
  const [mode, setMode] = useState("all");
  const [selected, setSelected] = useState(null);
  const [todayRows, setTodayRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null); // { id?, user_id, day, checkIn, checkOut }
  const [scanning, setScanning] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const people = users.filter(u => u.role === "لاعب" || u.role === "مدرب");

  const loadToday = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('attendance_log').select('*').eq('day', today());
    setTodayRows(data || []);
    setLoading(false);
  }, []);

  const loadLogs = useCallback(async (userId) => {
    setLoading(true);
    const { data } = await supabase.from('attendance_log').select('*').eq('user_id', userId).order('day', { ascending: false }).limit(21);
    setLogs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (mode === "all") loadToday(); }, [mode, loadToday]);
  useEffect(() => { if (selected) loadLogs(selected.id); }, [selected, loadLogs]);

  const refresh = () => { if (mode === "all") loadToday(); if (selected) loadLogs(selected.id); };

  const quickCheck = async (userId, field) => {
    const now = new Date().toISOString();
    if (field === "check_in") {
      const { error } = await supabase.from('attendance_log').upsert({ user_id: userId, day: today(), check_in: now }, { onConflict: 'user_id,day' });
      if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
      show("✅ تم تسجيل الحضور");
    } else {
      const { error } = await supabase.from('attendance_log').update({ check_out: now }).eq('user_id', userId).eq('day', today());
      if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
      show("✅ تم تسجيل الانصراف");
    }
    refresh();
  };

  const saveEdit = async () => {
    const payload = {
      user_id: editRow.user_id,
      day: editRow.day,
      check_in: toTimestamp(editRow.day, editRow.checkIn),
      check_out: toTimestamp(editRow.day, editRow.checkOut),
    };
    const { error } = await supabase.from('attendance_log').upsert(payload, { onConflict: 'user_id,day' });
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setEditRow(null);
    show("✅ تم حفظ الأوقات");
    refresh();
  };

  const deleteRow = async (row) => {
    await supabase.from('attendance_log').delete().eq('id', row.id);
    show("🗑️ تم حذف السجل", COLORS.danger);
    refresh();
  };

  const nameFor = (id) => people.find(p => p.id === id)?.name || id;
  const rowFor = (userId) => todayRows.find(r => r.user_id === userId);

  const openEdit = (userId, row, day) => setEditRow({
    id: row?.id, user_id: userId, day: row?.day || day || today(),
    checkIn: toTimeInput(row?.check_in), checkOut: toTimeInput(row?.check_out),
  });

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {/* وضعا العرض + زر مسح الباركود */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {[{ id: "all", label: "📋 حضور اليوم — الكل" }, { id: "single", label: "👤 سجل لاعب" }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: "9px 18px", borderRadius: 20, background: mode === m.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${mode === m.id ? COLORS.accent : COLORS.border}`, color: mode === m.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{m.label}</button>
        ))}
        {canEdit && (
          <button onClick={() => setScanning(true)} style={{ marginRight: "auto", padding: "9px 18px", borderRadius: 20, background: COLORS.accentBlue, border: "none", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>📷 مسح باركود الحضور</button>
        )}
      </div>

      {/* عرض الكل — اليوم (جدول على الشاشات الكبيرة، بطاقات على الجوال) */}
      {mode === "all" && isDesktop && (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ background: COLORS.surface }}>
                  {["الاسم", "الدور", "الحضور", "الانصراف", canEdit ? "إجراء" : null].filter(Boolean).map((h, i) => (
                    <th key={i} style={{ padding: "11px 12px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map(p => {
                  const row = rowFor(p.id);
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar letter={p.name[0]} size={30} color={p.role === "مدرب" ? COLORS.accentGold : COLORS.accent} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "9px", textAlign: "center" }}><Badge text={p.role} color={p.role === "مدرب" ? COLORS.accentGold : COLORS.accent} /></td>
                      <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmtTime(row?.check_in)} color={row?.check_in ? COLORS.accent : COLORS.textSecondary} /></td>
                      <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmtTime(row?.check_out)} color={row?.check_out ? COLORS.warning : COLORS.textSecondary} /></td>
                      {canEdit && (
                        <td style={{ padding: "9px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            {!row?.check_in && <button onClick={() => quickCheck(p.id, "check_in")} style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✅ حضور</button>}
                            {row?.check_in && !row?.check_out && <button onClick={() => quickCheck(p.id, "check_out")} style={{ background: COLORS.warning + "22", border: `1px solid ${COLORS.warning}44`, color: COLORS.warning, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>🚪 انصراف</button>}
                            <button onClick={() => openEdit(p.id, row)} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {loading && <div style={{ padding: 14, textAlign: "center", color: COLORS.textSecondary, fontSize: 12 }}>جاري التحديث...</div>}
        </div>
      )}

      {/* عرض الكل — بطاقات للجوال (كل شيء يظهر بدون سحب أفقي) */}
      {mode === "all" && !isDesktop && (
        <div>
          {loading && <div style={{ padding: 14, textAlign: "center", color: COLORS.textSecondary, fontSize: 12 }}>جاري التحديث...</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {people.map(p => {
              const row = rowFor(p.id);
              return (
                <div key={p.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Avatar letter={p.name[0]} size={34} color={p.role === "مدرب" ? COLORS.accentGold : COLORS.accent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{p.name}</div>
                      <Badge text={p.role} color={p.role === "مدرب" ? COLORS.accentGold : COLORS.accent} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: canEdit ? 10 : 0 }}>
                    <div style={{ flex: 1, background: COLORS.surface, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 3 }}>الحضور</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: row?.check_in ? COLORS.accent : COLORS.textSecondary }}>{fmtTime(row?.check_in)}</div>
                    </div>
                    <div style={{ flex: 1, background: COLORS.surface, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 3 }}>الانصراف</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: row?.check_out ? COLORS.warning : COLORS.textSecondary }}>{fmtTime(row?.check_out)}</div>
                    </div>
                  </div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {!row?.check_in && <button onClick={() => quickCheck(p.id, "check_in")} style={{ flex: 1, background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 9, padding: "9px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>✅ حضور</button>}
                      {row?.check_in && !row?.check_out && <button onClick={() => quickCheck(p.id, "check_out")} style={{ flex: 1, background: COLORS.warning + "22", border: `1px solid ${COLORS.warning}44`, color: COLORS.warning, borderRadius: 9, padding: "9px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>🚪 انصراف</button>}
                      <button onClick={() => openEdit(p.id, row)} style={{ flex: row?.check_in && row?.check_out ? 1 : "0 0 auto", background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✏️ تعديل الوقت</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* عرض لاعب واحد */}
      {mode === "single" && (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>سجل {selected.name} — آخر 21 يوم</div>
                {canEdit && (
                  <button onClick={() => openEdit(selected.id, null)} style={{ padding: "7px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ إضافة سجل</button>
                )}
              </div>
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
                {loading ? (
                  <div style={{ padding: 20, textAlign: "center", color: COLORS.textSecondary }}>جاري التحميل...</div>
                ) : logs.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: COLORS.textSecondary }}>لا يوجد سجل بعد</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: COLORS.surface }}>
                        {["اليوم", "الحضور", "الانصراف", canEdit ? "إجراء" : null].filter(Boolean).map((h, i) => (
                          <th key={i} style={{ padding: "9px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "9px", textAlign: "center", fontSize: 12, color: COLORS.textPrimary }}>{l.day}</td>
                          <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmtTime(l.check_in)} color={l.check_in ? COLORS.accent : COLORS.textSecondary} /></td>
                          <td style={{ padding: "9px", textAlign: "center" }}><Badge text={fmtTime(l.check_out)} color={l.check_out ? COLORS.warning : COLORS.textSecondary} /></td>
                          {canEdit && (
                            <td style={{ padding: "9px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                <button onClick={() => openEdit(selected.id, l)} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                                <button onClick={() => deleteRow(l)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                              </div>
                            </td>
                          )}
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
      )}

      {/* تعديل الأوقات */}
      {editRow && (
        <Modal title={`✏️ تعديل الأوقات — ${nameFor(editRow.user_id)}`} onClose={() => setEditRow(null)}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>اليوم</div>
            <input type="date" value={editRow.day} onChange={e => setEditRow(p => ({ ...p, day: e.target.value }))}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>وقت الحضور</div>
              <input type="time" value={editRow.checkIn} onChange={e => setEditRow(p => ({ ...p, checkIn: e.target.value }))}
                style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.accent, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>وقت الانصراف</div>
              <input type="time" value={editRow.checkOut} onChange={e => setEditRow(p => ({ ...p, checkOut: e.target.value }))}
                style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.warning, borderRadius: 10, padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setEditRow(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveEdit} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ الأوقات</button>
          </div>
        </Modal>
      )}

      {/* ماسح الباركود */}
      {scanning && (
        <ScanAttendance
          players={people}
          onClose={() => { setScanning(false); refresh(); }}
          onRecorded={refresh}
        />
      )}
    </div>
  );
}
