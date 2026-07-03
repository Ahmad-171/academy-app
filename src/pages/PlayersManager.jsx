import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Avatar, Badge, MiniBar, ToastMsg } from "../components/ui";

export function PlayersManager({ users, setUsers, user }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("attendance");
  const [editRatings, setEditRatings] = useState({});
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editRatings;
  const canEditAtt = user.role === "مدير" || user.permissions?.editSchedule;

  const players = users.filter(u => u.role === "لاعب");

  const toggleAtt = (idx) => {
    if (!canEditAtt) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const log = [...(u.attendanceLog || [])];
      log[idx] = !log[idx];
      const pct = log.length ? Math.round(log.filter(Boolean).length / log.length * 100) : 0;
      const updated = { ...u, attendanceLog: log, attendance: pct };
      setSelected(updated);
      return updated;
    }));
  };

  const addWeek = () => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const log = [...(u.attendanceLog || []), false, false, false, false, false, false, false];
      const pct = log.length ? Math.round(log.filter(Boolean).length / log.length * 100) : 0;
      const updated = { ...u, attendanceLog: log, attendance: pct };
      setSelected(updated);
      return updated;
    }));
    show("✅ تم إضافة أسبوع جديد");
  };

  const saveRatings = () => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selected.id) return u;
      const updated = { ...u, ratings: { ...u.ratings, ...editRatings } };
      setSelected(updated);
      return updated;
    }));
    show("✅ تم حفظ التقييمات");
  };

  const days = ["أحد", "اثن", "ثلا", "أرب", "خمس", "جمع", "سبت"];

  return (
    <div>
      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* قائمة اللاعبين */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>⚽ قائمة اللاعبين ({players.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: isDesktop ? 0 : 16 }}>
            {players.map(p => (
              <div key={p.id} onClick={() => { setSelected(p); setEditRatings(p.ratings || {}); setTab("attendance"); }}
                style={{ background: selected?.id === p.id ? `${COLORS.accent}18` : COLORS.cardBg, border: `1px solid ${selected?.id === p.id ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar letter={p.name[0]} size={36} color={COLORS.accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.position} · {p.membership}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: p.attendance >= 80 ? COLORS.accent : COLORS.danger }}>{p.attendance}٪</div>
                  <div style={{ fontSize: 9, color: COLORS.textSecondary }}>حضور</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل اللاعب */}
        {selected ? (
          <div>
            {/* هيدر اللاعب */}
            <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar letter={selected.name[0]} size={52} color={COLORS.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{selected.position} · عضوية {selected.membership}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <Badge text={`${selected.attendance}٪ حضور`} color={selected.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                  <Badge text={`${selected.points} نقطة`} color={COLORS.accentGold} />
                  <Badge text={selected.status || "نشط"} color={COLORS.accent} />
                </div>
              </div>
            </div>

            {/* تبويبات */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "attendance", label: "✅ الحضور" },
                { id: "performance", label: "📊 الأداء" },
                { id: "info", label: "👤 البيانات" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex: 1, padding: "9px", borderRadius: 11, background: tab === t.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`, color: tab === t.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* سجل الحضور */}
            {tab === "attendance" && (
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>سجل الحضور الكامل</div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                      {(selected.attendanceLog || []).filter(Boolean).length} حضور من {(selected.attendanceLog || []).length} جلسة
                    </div>
                  </div>
                  {canEditAtt && (
                    <button onClick={addWeek} style={{ padding: "8px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ أسبوع جديد</button>
                  )}
                </div>

                {/* عرض أسبوعي */}
                {Array.from({ length: Math.ceil((selected.attendanceLog || []).length / 7) }).map((_, weekIdx) => (
                  <div key={weekIdx} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8, fontWeight: 600 }}>
                      الأسبوع {weekIdx + 1}
                      <span style={{ marginRight: 8, color: COLORS.accent }}>
                        ({(selected.attendanceLog || []).slice(weekIdx * 7, weekIdx * 7 + 7).filter(Boolean).length}/7 حضور)
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {days.map((day, dayIdx) => {
                        const globalIdx = weekIdx * 7 + dayIdx;
                        const val = (selected.attendanceLog || [])[globalIdx];
                        if (globalIdx >= (selected.attendanceLog || []).length) return (
                          <div key={dayIdx} style={{ flex: 1, height: 52, borderRadius: 10, background: COLORS.surface, border: `1px dashed ${COLORS.border}` }} />
                        );
                        return (
                          <button key={dayIdx} onClick={() => toggleAtt(globalIdx)}
                            style={{ flex: 1, height: 52, borderRadius: 10, background: val ? `${COLORS.accent}22` : `${COLORS.danger}15`, border: `1px solid ${val ? COLORS.accent + "55" : COLORS.danger + "33"}`, cursor: canEditAtt ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                            <span style={{ fontSize: 14 }}>{val ? "✅" : "❌"}</span>
                            <span style={{ fontSize: 9, color: COLORS.textSecondary }}>{day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* شريط الحضور */}
                <div style={{ marginTop: 16, background: COLORS.surface, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: COLORS.textSecondary }}>نسبة الحضور الإجمالية</span>
                    <span style={{ color: selected.attendance >= 80 ? COLORS.accent : COLORS.danger, fontWeight: 800 }}>{selected.attendance}٪</span>
                  </div>
                  <MiniBar percent={selected.attendance} color={selected.attendance >= 80 ? COLORS.accent : COLORS.danger} />
                </div>
              </div>
            )}

            {/* تقييم الأداء */}
            {tab === "performance" && (
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 18 }}>📊 تقييم الأداء</div>
                {[
                  { label: "السرعة",         key: "speed",    color: COLORS.accent },
                  { label: "التمرير",        key: "passing",  color: COLORS.accentBlue },
                  { label: "التسديد",        key: "shooting", color: COLORS.warning },
                  { label: "الدفاع",         key: "defense",  color: COLORS.purple },
                  { label: "الروح الرياضية", key: "spirit",   color: COLORS.accentGold },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>{s.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {canEdit && (
                          <input type="number" min="0" max="100"
                            value={editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)}
                            onChange={e => setEditRatings(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                            style={{ width: 58, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: s.color, borderRadius: 8, padding: "4px 8px", fontSize: 14, fontWeight: 800, textAlign: "center" }} />
                        )}
                        <span style={{ color: s.color, fontWeight: 800, minWidth: 40 }}>
                          {editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)}٪
                        </span>
                      </div>
                    </div>
                    <MiniBar percent={editRatings[s.key] ?? (selected.ratings?.[s.key] || 0)} color={s.color} />
                  </div>
                ))}
                {canEdit && (
                  <button onClick={saveRatings}
                    style={{ width: "100%", padding: "13px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer", marginTop: 8 }}>
                    💾 حفظ التقييمات
                  </button>
                )}
              </div>
            )}

            {/* البيانات */}
            {tab === "info" && (
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
                {[
                  { label: "الاسم",     value: selected.name,       icon: "👤" },
                  { label: "الهوية",    value: selected.id,         icon: "🪪" },
                  { label: "الجوال",    value: selected.phone,      icon: "📱" },
                  { label: "المركز",    value: selected.position,   icon: "⚽" },
                  { label: "العضوية",   value: selected.membership, icon: "🏅" },
                  { label: "الحالة",    value: selected.status,     icon: "🔵" },
                  { label: "النقاط",    value: String(selected.points), icon: "⭐" },
                  { label: "الحضور",    value: `${selected.attendance}٪`, icon: "✅" },
                ].map((item, i) => (
                  <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value || "-"}</div>
                    </div>
                  </div>
                ))}

                {/* السجل الطبي */}
                {selected.medical && (
                  <>
                    <div style={{ gridColumn: "1/-1", fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 8 }}>🏥 السجل الطبي</div>
                    {[
                      { label: "الحالة الصحية",    key: "health",      icon: "💚" },
                      { label: "الإصابات",          key: "injuries",    icon: "🩹" },
                      { label: "الحساسية",          key: "allergies",   icon: "🌿" },
                      { label: "الأدوية",           key: "medications", icon: "💊" },
                    ].map((item, i) => (
                      <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                          <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>{selected.medical[item.key] || "لا يوجد"}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "60px", textAlign: "center", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>⚽</div>
            <div style={{ fontSize: 15 }}>اختر لاعباً من القائمة لعرض ملفه</div>
          </div>
        )}
      </div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
    </div>
  );
}
