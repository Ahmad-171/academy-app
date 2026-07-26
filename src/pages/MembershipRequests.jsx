import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useToast } from "../hooks/useToast";
import { Avatar, Badge, ToastMsg } from "../components/ui";

const fmt = (ts) => ts ? new Date(ts).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }) : "";
const METHOD_LABEL = { cash: "💵 كاش", transfer: "🏦 تحويل بنكي" };

// طلبات العضوية: يظهر للمدير/صاحب صلاحية الاشتراكات كل عضوية اختارها لاعب،
// مع طريقة الدفع، وأزرار تفعيل أو رفض. التفعيل يضبط عضوية اللاعب.
export function MembershipRequests({ users = [], setUsers }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('membership_requests').select('*').order('created_at', { ascending: false }).limit(60);
    setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const nameFor = (id) => users.find(u => u.id === id)?.name || id;

  const approve = async (r) => {
    setBusy(r.id);
    const { error: e1 } = await supabase.from('users').update({ membership: r.membership_name }).eq('id', r.user_id);
    if (e1) { setBusy(null); show(`⚠️ ${e1.message}`, COLORS.danger); return; }
    const { error: e2 } = await supabase.from('membership_requests').update({ status: 'approved', decided_at: new Date().toISOString() }).eq('id', r.id);
    if (e2) { setBusy(null); show(`⚠️ ${e2.message}`, COLORS.danger); return; }
    setUsers?.(prev => prev.map(u => u.id === r.user_id ? { ...u, membership: r.membership_name } : u));
    setBusy(null);
    show(`✅ تم تفعيل عضوية ${r.membership_name} لـ ${nameFor(r.user_id)}`);
    load();
  };

  const reject = async (r) => {
    setBusy(r.id);
    const { error } = await supabase.from('membership_requests').update({ status: 'rejected', decided_at: new Date().toISOString() }).eq('id', r.id);
    setBusy(null);
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    show(`تم رفض الطلب`, COLORS.warning);
    load();
  };

  const pending = rows.filter(r => (r.status || 'pending') === 'pending');
  const decided = rows.filter(r => r.status === 'approved' || r.status === 'rejected');

  const Card = ({ r, showActions }) => (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar letter={(nameFor(r.user_id) || "?")[0]} size={36} color={COLORS.accentGold} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{nameFor(r.user_id)}</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{fmt(r.created_at)}</div>
        </div>
        {r.status === 'approved' && <Badge text="مفعّل" color={COLORS.accent} />}
        {r.status === 'rejected' && <Badge text="مرفوض" color={COLORS.danger} />}
        {(r.status || 'pending') === 'pending' && <Badge text="قيد المراجعة" color={COLORS.warning} />}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: showActions ? 12 : 0 }}>
        <span style={{ fontSize: 12, background: COLORS.surface, borderRadius: 8, padding: "5px 10px", color: COLORS.accentGold, fontWeight: 800 }}>💎 عضوية {r.membership_name}</span>
        {r.amount > 0 && <span style={{ fontSize: 12, background: COLORS.surface, borderRadius: 8, padding: "5px 10px", color: COLORS.accentGold, fontWeight: 800 }}>{r.amount} ر.س</span>}
        <span style={{ fontSize: 12, background: COLORS.surface, borderRadius: 8, padding: "5px 10px", color: COLORS.textSecondary }}>{METHOD_LABEL[r.method] || "💵 كاش"}</span>
      </div>
      {showActions && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => reject(r)} disabled={busy === r.id} style={{ flex: 1, padding: "9px", borderRadius: 9, background: COLORS.danger + "18", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>✕ رفض</button>
          <button onClick={() => approve(r)} disabled={busy === r.id} style={{ flex: 2, padding: "9px", borderRadius: 9, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{busy === r.id ? "..." : "✓ تفعيل"}</button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: 26 }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>💎 طلبات العضوية</div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>فعّل أو ارفض طلبات العضوية التي اختارها اللاعبون.</div>

      <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.warning, marginBottom: 10 }}>قيد المراجعة ({pending.length})</div>
      {loading ? (
        <div style={{ padding: 20, textAlign: "center", color: COLORS.textSecondary }}>جاري التحميل...</div>
      ) : pending.length === 0 ? (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 22, textAlign: "center", color: COLORS.textSecondary, fontSize: 13, marginBottom: 22 }}>لا توجد طلبات عضوية قيد المراجعة</div>
      ) : (
        <div style={{ marginBottom: 22 }}>{pending.map(r => <Card key={r.id} r={r} showActions />)}</div>
      )}

      {decided.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 10 }}>سجل طلبات العضوية</div>
          {decided.map(r => <Card key={r.id} r={r} showActions={false} />)}
        </>
      )}
    </div>
  );
}
