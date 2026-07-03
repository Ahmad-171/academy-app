import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Modal, Field, ToastMsg } from "../components/ui";

export function TournamentsPage({ user, tournaments, setTournaments, schedule = [] }) {
  const [editTeamModal, setEditTeamModal] = useState(null);
  const [editScorerModal, setEditScorerModal] = useState(null);
  const [addTeamModal, setAddTeamModal] = useState(false);
  const [addScorerModal, setAddScorerModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", p: 0, w: 0, d: 0, l: 0, pts: 0 });
  const [newScorer, setNewScorer] = useState({ name: "", goals: 0, team: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editTournaments;

  const saveTeam = () => {
    if (editTeamModal.id) {
      setTournaments(prev => ({ ...prev, teams: prev.teams.map(t => t.id === editTeamModal.id ? editTeamModal : t) }));
    }
    setEditTeamModal(null);
    show("✅ تم تحديث الفريق");
  };

  const deleteTeam = (id) => {
    setTournaments(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));
    show("🗑️ تم حذف الفريق", COLORS.danger);
  };

  const addTeam = () => {
    if (!newTeam.name) { show("⚠️ أدخل اسم الفريق", COLORS.warning); return; }
    setTournaments(prev => ({ ...prev, teams: [...prev.teams, { ...newTeam, id: Date.now(), p: Number(newTeam.p), w: Number(newTeam.w), d: Number(newTeam.d), l: Number(newTeam.l), pts: Number(newTeam.pts) }] }));
    setNewTeam({ name: "", p: 0, w: 0, d: 0, l: 0, pts: 0 });
    setAddTeamModal(false);
    show("✅ تم إضافة الفريق");
  };

  const saveScorer = () => {
    if (editScorerModal.id) {
      setTournaments(prev => ({ ...prev, scorers: prev.scorers.map(s => s.id === editScorerModal.id ? { ...editScorerModal, goals: Number(editScorerModal.goals) } : s) }));
    }
    setEditScorerModal(null);
    show("✅ تم تحديث الهداف");
  };

  const deleteScorer = (id) => {
    setTournaments(prev => ({ ...prev, scorers: prev.scorers.filter(s => s.id !== id) }));
    show("🗑️ تم حذف الهداف", COLORS.danger);
  };

  const addScorer = () => {
    if (!newScorer.name) { show("⚠️ أدخل اسم اللاعب", COLORS.warning); return; }
    setTournaments(prev => ({ ...prev, scorers: [...prev.scorers, { ...newScorer, id: Date.now(), goals: Number(newScorer.goals) }] }));
    setNewScorer({ name: "", goals: 0, team: "" });
    setAddScorerModal(false);
    show("✅ تم إضافة الهداف");
  };

  const sortedTeams   = [...tournaments.teams].sort((a, b) => b.pts - a.pts);
  const sortedScorers = [...tournaments.scorers].sort((a, b) => b.goals - a.goals);

  const nextMatch = [...schedule].sort((a, b) => a.order - b.order).find(s => s.type === "مباراة");
  const [homeTeam, awayTeam] = nextMatch ? nextMatch.team.split(/\s+vs\s+/i) : [];

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>🏆 البطولات</div>

      {/* المباراة القادمة */}
      {nextMatch ? (
        <div style={{ background: "linear-gradient(135deg,#1a0d00,#3d2200)", border: `1px solid ${COLORS.warning}44`, borderRadius: 18, padding: "20px", marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: COLORS.warning, fontWeight: 700, marginBottom: 14 }}>⚡ المباراة القادمة</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 420, margin: "0 auto" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isDesktop ? 44 : 32 }}>⚽</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 6 }}>{homeTeam?.trim() || nextMatch.team}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 900, color: COLORS.warning }}>VS</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>{nextMatch.day} {nextMatch.time}</div>
            </div>
            {awayTeam && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isDesktop ? 44 : 32 }}>🏟️</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginTop: 6 }}>{awayTeam.trim()}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: "20px", marginBottom: 22, textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>
          لا توجد مباراة قادمة بالجدول حاليًا
        </div>
      )}

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ترتيب الفرق */}
        <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>ترتيب الفرق</div>
            {canEdit && (
              <button onClick={() => setAddTeamModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ فريق</button>
            )}
          </div>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.surface }}>
                  {["#", "الفريق", "ل", "ت", "خ", "نق", canEdit ? "" : null].filter(h => h !== null).map((h, i) => (
                    <th key={i} style={{ padding: "11px 8px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i === 0 ? `${COLORS.accent}08` : "transparent" }}>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? COLORS.accent : COLORS.textSecondary }}>{i + 1}</td>
                    <td style={{ padding: "11px 8px", fontSize: 13, color: COLORS.textPrimary, fontWeight: i === 0 ? 700 : 400 }}>{t.name}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.accent }}>{t.w}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.textSecondary }}>{t.d}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 13, color: COLORS.danger }}>{t.l}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{t.pts}</td>
                    {canEdit && (
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={() => setEditTeamModal({ ...t })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                          <button onClick={() => deleteTeam(t.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* الهدافون - مدير ومدرب فقط */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>🥅 الهدافون</div>
            {canEdit && (
              <button onClick={() => setAddScorerModal(true)} style={{ padding: "6px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ هداف</button>
            )}
          </div>

          {(user.role === "مدير" || user.role === "مدرب") ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedScorers.map((s, i) => (
                <div key={s.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: i === 0 ? `${COLORS.accentGold}22` : COLORS.surface, border: `1px solid ${i === 0 ? COLORS.accentGold : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? COLORS.accentGold : COLORS.textSecondary }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.team}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 40 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? COLORS.accentGold : COLORS.textPrimary }}>{s.goals}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary }}>هدف</div>
                  </div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setEditScorerModal({ ...s })} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                      <button onClick={() => deleteScorer(s.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "30px", textAlign: "center", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div>جدول الهدافين للمدير والمدرب فقط</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addTeamModal && (
        <Modal title="➕ إضافة فريق" onClose={() => setAddTeamModal(false)}>
          <Field label="اسم الفريق" value={newTeam.name} onChange={v => setNewTeam(p => ({ ...p, name: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="المباريات" value={String(newTeam.p)} onChange={v => setNewTeam(p => ({ ...p, p: v }))} type="number" />
            <Field label="فوز" value={String(newTeam.w)} onChange={v => setNewTeam(p => ({ ...p, w: v }))} type="number" />
            <Field label="تعادل" value={String(newTeam.d)} onChange={v => setNewTeam(p => ({ ...p, d: v }))} type="number" />
            <Field label="خسارة" value={String(newTeam.l)} onChange={v => setNewTeam(p => ({ ...p, l: v }))} type="number" />
            <Field label="النقاط" value={String(newTeam.pts)} onChange={v => setNewTeam(p => ({ ...p, pts: v }))} type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddTeamModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addTeam} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {editTeamModal && (
        <Modal title="✏️ تعديل الفريق" onClose={() => setEditTeamModal(null)}>
          <Field label="اسم الفريق" value={editTeamModal.name} onChange={v => setEditTeamModal(p => ({ ...p, name: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="المباريات" value={String(editTeamModal.p)} onChange={v => setEditTeamModal(p => ({ ...p, p: Number(v) }))} type="number" />
            <Field label="فوز" value={String(editTeamModal.w)} onChange={v => setEditTeamModal(p => ({ ...p, w: Number(v) }))} type="number" />
            <Field label="تعادل" value={String(editTeamModal.d)} onChange={v => setEditTeamModal(p => ({ ...p, d: Number(v) }))} type="number" />
            <Field label="خسارة" value={String(editTeamModal.l)} onChange={v => setEditTeamModal(p => ({ ...p, l: Number(v) }))} type="number" />
            <Field label="النقاط" value={String(editTeamModal.pts)} onChange={v => setEditTeamModal(p => ({ ...p, pts: Number(v) }))} type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditTeamModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveTeam} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}

      {addScorerModal && (
        <Modal title="➕ إضافة هداف" onClose={() => setAddScorerModal(false)}>
          <Field label="اسم اللاعب" value={newScorer.name} onChange={v => setNewScorer(p => ({ ...p, name: v }))} />
          <Field label="النادي" value={newScorer.team} onChange={v => setNewScorer(p => ({ ...p, team: v }))} />
          <Field label="عدد الأهداف" value={String(newScorer.goals)} onChange={v => setNewScorer(p => ({ ...p, goals: v }))} type="number" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddScorerModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addScorer} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {editScorerModal && (
        <Modal title="✏️ تعديل الهداف" onClose={() => setEditScorerModal(null)}>
          <Field label="اسم اللاعب" value={editScorerModal.name} onChange={v => setEditScorerModal(p => ({ ...p, name: v }))} />
          <Field label="النادي" value={editScorerModal.team} onChange={v => setEditScorerModal(p => ({ ...p, team: v }))} />
          <Field label="عدد الأهداف" value={String(editScorerModal.goals)} onChange={v => setEditScorerModal(p => ({ ...p, goals: Number(v) }))} type="number" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditScorerModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveScorer} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
