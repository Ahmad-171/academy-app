import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Badge, Avatar, Modal, Field, ToastMsg } from "../components/ui";

export function SchedulePage({ user, schedule, setSchedule, users, setUsers }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [, setEditAttModal] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [newItem, setNewItem] = useState({ day: "الأحد", time: "", type: "تدريب", team: "", location: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editSchedule;
  const canEditAtt = user.role === "مدير";

  const players = users.filter(u => u.role === "لاعب");
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const addItem = async () => {
    if (!newItem.time || !newItem.team || !newItem.location) { show("⚠️ أكمل جميع الحقول", COLORS.warning); return; }
    const { data } = await supabase.from('schedule').insert({
      day: newItem.day, time: newItem.time, type: newItem.type,
      team: newItem.team, location: newItem.location, order: schedule.length + 1,
    }).select().single();
    if (data) setSchedule(prev => [...prev, data]);
    setNewItem({ day: "الأحد", time: "", type: "تدريب", team: "", location: "" });
    setAddModal(false);
    show("✅ تم إضافة الموعد");
  };

  const deleteItem = async (id) => {
    await supabase.from('schedule').delete().eq('id', id);
    setSchedule(prev => prev.filter(s => s.id !== id));
    show("🗑️ تم حذف الموعد", COLORS.danger);
  };

const saveEdit = async () => {
    await supabase.from('schedule').update({
      day: editModal.day, time: editModal.time, type: editModal.type,
      team: editModal.team, location: editModal.location,
    }).eq('id', editModal.id);
    setSchedule(prev => prev.map(s => s.id === editModal.id ? editModal : s));
    setEditModal(null);
    show("✅ تم تحديث الموعد");
  };

  const moveItem = async (id, dir) => {
    const arr = [...schedule].sort((a, b) => a.order - b.order);
    const idx = arr.findIndex(s => s.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === arr.length - 1) return;
    const swap = dir === "up" ? idx - 1 : idx + 1;
    const newArr = [...arr];
    [newArr[idx].order, newArr[swap].order] = [newArr[swap].order, newArr[idx].order];
    setSchedule(newArr);
    await supabase.from('schedule').update({ order: newArr[idx].order }).eq('id', newArr[idx].id);
    await supabase.from('schedule').update({ order: newArr[swap].order }).eq('id', newArr[swap].id);
  };

  const toggleAtt = (playerId, sessionIdx) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== playerId) return u;
      const log = [...(u.attendanceLog || [])];
      log[sessionIdx] = !log[sessionIdx];
      const attPct = log.length ? Math.round((log.filter(Boolean).length / log.length) * 100) : 0;
      return { ...u, attendanceLog: log, attendance: attPct };
    }));
  };

  const sortedSchedule = [...schedule].sort((a, b) => a.order - b.order);

  // ولي الأمر يشوف حضور ابنه فقط
  const myChild = user.role === "ولي أمر" ? users.find(u => u.id === user.childId) : null;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>الجداول والمواعيد</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>إجمالي {schedule.length} موعد</div>
        </div>
        {canEdit && (
          <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ إضافة</button>
        )}
      </div>

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* جدول التمارين */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📅 جدول التمارين والمباريات</div>

          {/* باركود للاعب */}
          {user.role === "لاعب" && (
            <div style={{ background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 16, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>📲 باركود الحضور</div>
              {qrVisible ? (
                <div style={{ width: 110, height: 110, margin: "0 auto", background: "#fff", borderRadius: 10, padding: 6, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                  {Array(49).fill(0).map((_, i) => <div key={i} style={{ background: [0,1,2,6,7,13,14,15,16,20,21,27,28,29,34,35,41,42,43,44,48].includes(i) ? "#000" : "#fff", borderRadius: 1 }} />)}
                </div>
              ) : (
                <button onClick={() => setQrVisible(true)} style={{ background: COLORS.accent, border: "none", color: "#000", padding: "9px 24px", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>عرض الباركود</button>
              )}
            </div>
          )}

          {/* الجدول على شكل جدول */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.surface }}>
                  {["اليوم", "الوقت", "النوع", "الفريق", "الملعب", canEdit ? "إجراء" : ""].filter(Boolean).map((h, i) => (
                    <th key={i} style={{ padding: "11px 10px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSchedule.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: s.type === "مباراة" ? `${COLORS.warning}08` : "transparent" }}>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{s.day}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>{s.time}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <Badge text={s.type === "مباراة" ? "🏆 مباراة" : "🏃 تدريب"} color={s.type === "مباراة" ? COLORS.warning : COLORS.accent} />
                    </td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{s.team}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{s.location}</td>
                    {canEdit && (
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={() => moveItem(s.id, "up")} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>↑</button>
                          <button onClick={() => moveItem(s.id, "down")} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>↓</button>
                          <button onClick={() => setEditModal({ ...s })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                          <button onClick={() => deleteItem(s.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {sortedSchedule.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد مواعيد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* جدول الحضور */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>✅ جدول الحضور والغياب</div>
            {canEditAtt && <button onClick={() => setEditAttModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>تعديل</button>}
          </div>

          {/* ولي الأمر يشوف ابنه فقط */}
          {user.role === "ولي أمر" && myChild ? (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Avatar letter={myChild.name[0]} size={36} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{myChild.name}</div>
                  <Badge text={`${myChild.attendance}٪ حضور`} color={myChild.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(myChild.attendanceLog || []).map((a, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: a ? COLORS.accent + "22" : COLORS.danger + "22", border: `1px solid ${a ? COLORS.accent : COLORS.danger}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a ? "✅" : "❌"}</div>
                ))}
              </div>
            </div>
          ) : (user.role === "مدير" || user.role === "مدرب") ? (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: COLORS.surface }}>
                      <th style={{ padding: "10px 12px", fontSize: 11, color: COLORS.textSecondary, textAlign: "right", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>اللاعب</th>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <th key={n} style={{ padding: "10px 6px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>ج{n}</th>
                      ))}
                      <th style={{ padding: "10px 8px", fontSize: 11, color: COLORS.textSecondary, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>٪</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: COLORS.textPrimary, fontWeight: 600, whiteSpace: "nowrap" }}>{p.name}</td>
                        {(p.attendanceLog || Array(10).fill(false)).map((a, j) => (
                          <td key={j} style={{ padding: "6px", textAlign: "center" }}>
                            <button onClick={() => canEditAtt && toggleAtt(p.id, j)} style={{ background: "none", border: "none", cursor: canEditAtt ? "pointer" : "default", fontSize: 14 }}>{a ? "✅" : "❌"}</button>
                          </td>
                        ))}
                        <td style={{ padding: "9px 8px", textAlign: "center" }}>
                          <Badge text={`${p.attendance}٪`} color={p.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "30px", textAlign: "center", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div>جدول الحضور متاح للمدير والمدرب فقط</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal إضافة موعد */}
      {addModal && (
        <Modal title="➕ إضافة موعد" onClose={() => setAddModal(false)}>
          <Field label="اليوم" value={newItem.day} onChange={v => setNewItem(p => ({ ...p, day: v }))} options={days} />
          <Field label="الوقت" value={newItem.time} onChange={v => setNewItem(p => ({ ...p, time: v }))} placeholder="مثال: ٤:٠٠ م" />
          <Field label="النوع" value={newItem.type} onChange={v => setNewItem(p => ({ ...p, type: v }))} options={["تدريب", "مباراة", "بطولة"]} />
          <Field label="الفريق / المباراة" value={newItem.team} onChange={v => setNewItem(p => ({ ...p, team: v }))} placeholder="مثال: الفريق 1 أو الفريق 1 vs النادي 2" />
          <Field label="الملعب / الموقع" value={newItem.location} onChange={v => setNewItem(p => ({ ...p, location: v }))} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addItem} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {/* Modal تعديل موعد */}
      {editModal && (
        <Modal title="✏️ تعديل الموعد" onClose={() => setEditModal(null)}>
          <Field label="اليوم" value={editModal.day} onChange={v => setEditModal(p => ({ ...p, day: v }))} options={days} />
          <Field label="الوقت" value={editModal.time} onChange={v => setEditModal(p => ({ ...p, time: v }))} />
          <Field label="النوع" value={editModal.type} onChange={v => setEditModal(p => ({ ...p, type: v }))} options={["تدريب", "مباراة", "بطولة"]} />
          <Field label="الفريق" value={editModal.team} onChange={v => setEditModal(p => ({ ...p, team: v }))} />
          <Field label="الملعب" value={editModal.location} onChange={v => setEditModal(p => ({ ...p, location: v }))} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveEdit} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
