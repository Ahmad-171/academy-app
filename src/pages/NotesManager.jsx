import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Field, ToastMsg } from "../components/ui";

export function NotesManager({ users }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerId, setPlayerId] = useState("");
  const [text, setText] = useState("");
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const players = users.filter(u => u.role === "لاعب");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('player_notes').select('*').order('created_at', { ascending: false }).limit(50);
    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addNote = async () => {
    if (!playerId || !text.trim()) { show("⚠️ اختر لاعبًا واكتب الملاحظة", COLORS.warning); return; }
    const { error } = await supabase.from('player_notes').insert({ user_id: playerId, note: text.trim() });
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setText("");
    show("✅ تم إضافة الملاحظة");
    load();
  };

  const nameFor = (id) => players.find(p => p.id === id)?.name || id;

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 20, maxWidth: 560 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>➕ إضافة ملاحظة</div>
        <Field label="اللاعب" value={playerId} onChange={setPlayerId}
          options={[{ value: "", label: "اختر لاعبًا..." }, ...players.map(p => ({ value: p.id, label: p.name }))]} />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>الملاحظة</div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="اكتب ملاحظتك..."
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <button onClick={addNote} style={{ width: "100%", padding: "11px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>➕ إضافة الملاحظة</button>
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>📋 كل الملاحظات</div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: COLORS.textSecondary }}>جاري التحميل...</div>
      ) : notes.length === 0 ? (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 30, textAlign: "center", color: COLORS.textSecondary }}>لا توجد ملاحظات بعد</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 12 }}>
          {notes.map(n => (
            <div key={n.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "13px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent }}>{nameFor(n.user_id)}</span>
                <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{new Date(n.created_at).toLocaleDateString("ar-SA")}</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{n.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
