import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Avatar, MiniBar, ToastMsg } from "../components/ui";

const CRITERIA = [
  { label: "السرعة",         key: "speed",    color: COLORS.accent },
  { label: "التمرير",        key: "passing",  color: COLORS.accentBlue },
  { label: "التسديد",        key: "shooting", color: COLORS.warning },
  { label: "الدفاع",         key: "defense",  color: COLORS.purple },
  { label: "الروح الرياضية", key: "spirit",   color: COLORS.accentGold },
];

export function EvaluationManager({ users }) {
  const [selected, setSelected] = useState(null);
  const [ratings, setRatings] = useState({});
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const players = users.filter(u => u.role === "لاعب");

  const loadHistory = useCallback(async (userId) => {
    const { data } = await supabase.from('evaluations').select('*').eq('user_id', userId).order('eval_date', { ascending: false }).limit(10);
    setHistory(data || []);
  }, []);

  useEffect(() => {
    if (selected) { setRatings(selected.ratings || {}); setNote(""); loadHistory(selected.id); }
  }, [selected, loadHistory]);

  const saveEvaluation = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    await supabase.from('evaluations').insert({ user_id: selected.id, ratings, note });
    await supabase.from('users').update({ ratings }).eq('id', selected.id);
    setSubmitting(false);
    setNote("");
    show("✅ تم حفظ التقييم");
    loadHistory(selected.id);
  };

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>اختر لاعبًا</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: isDesktop ? 0 : 16 }}>
            {players.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{ background: selected?.id === p.id ? `${COLORS.accent}18` : COLORS.cardBg, border: `1px solid ${selected?.id === p.id ? COLORS.accent : COLORS.border}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar letter={p.name[0]} size={32} color={COLORS.accent} />
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div>
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>تقييم جديد — {selected.name}</div>
              {CRITERIA.map(c => (
                <div key={c.key} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: COLORS.textSecondary }}>{c.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="number" min="0" max="100" value={ratings[c.key] || 0}
                        onChange={e => setRatings(p => ({ ...p, [c.key]: Number(e.target.value) }))}
                        style={{ width: 52, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c.color, borderRadius: 6, padding: "2px 6px", fontSize: 13, fontWeight: 700, textAlign: "center" }} />
                      <span style={{ color: c.color, fontWeight: 700 }}>٪</span>
                    </div>
                  </div>
                  <MiniBar percent={ratings[c.key] || 0} color={c.color} />
                </div>
              ))}
              <div style={{ marginTop: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>ملاحظات التقييم</div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="ملاحظات عن أداء اللاعب..."
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={saveEvaluation} disabled={submitting} style={{ width: "100%", padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>{submitting ? "جاري الحفظ..." : "💾 حفظ التقييم"}</button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>سجل التقييمات السابقة</div>
            {history.length === 0 ? (
              <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, textAlign: "center", color: COLORS.textSecondary }}>لا توجد تقييمات سابقة</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(h => (
                  <div key={h.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>{h.eval_date}</span>
                    </div>
                    {h.note && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>{h.note}</div>}
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
        ) : (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "50px", textAlign: "center", color: COLORS.textSecondary }}>
            اختر لاعبًا من القائمة لتقييمه
          </div>
        )}
      </div>
    </div>
  );
}
