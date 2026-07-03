import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Badge, Modal, Field, ToastMsg } from "../components/ui";

export function FinanceManager({ user }) {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [addModal, setAddModal]       = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [newRecord, setNewRecord]     = useState({ type: "revenue", label: "", amount: "", date: "", note: "" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editData;

  useEffect(() => { loadFinance(); }, []);

  const loadFinance = async () => {
    setLoading(true);
    const { data } = await supabase.from('finance').select('*').order('id', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const addRecord = async () => {
    if (!newRecord.label.trim() || !newRecord.amount) { show("⚠️ أكمل الحقول المطلوبة", COLORS.warning); return; }
    const { data } = await supabase.from('finance').insert({
      type: newRecord.type, label: newRecord.label,
      amount: Number(newRecord.amount), date: newRecord.date, note: newRecord.note,
    }).select().single();
    if (data) setRecords(prev => [data, ...prev]);
    setNewRecord({ type: "revenue", label: "", amount: "", date: "", note: "" });
    setAddModal(false);
    show("✅ تم إضافة السجل");
  };

  const deleteRecord = async (id) => {
    await supabase.from('finance').delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
    show("🗑️ تم الحذف", COLORS.danger);
    setDetailModal(null);
  };

  const totalRevenue = records.filter(r => r.type === "revenue").reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  const netProfit    = totalRevenue - totalExpense;
  const filtered     = filter === "all" ? records : records.filter(r => r.type === filter);
  const formatNum    = (n) => n.toLocaleString("ar-SA");

  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px", color: COLORS.textSecondary }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
      <div>جاري تحميل البيانات...</div>
    </div>
  );

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {/* بطاقات الملخص */}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr", gap: 12, marginBottom: 22 }}>
        {[
          { label: "إجمالي الإيرادات", value: formatNum(totalRevenue), icon: "💰", color: COLORS.accent,     type: "revenue" },
          { label: "إجمالي المصروفات", value: formatNum(totalExpense), icon: "📉", color: COLORS.danger,     type: "expense" },
          { label: "صافي الربح",        value: formatNum(netProfit),    icon: "📈", color: COLORS.accentGold, type: "all" },
        ].map((card, i) => (
          <div key={i} onClick={() => setFilter(filter === card.type ? "all" : card.type)}
            style={{ background: filter === card.type ? `${card.color}18` : COLORS.cardBg, border: `2px solid ${filter === card.type ? card.color : COLORS.border}`, borderRadius: 16, padding: "20px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: card.color }}>{card.value} <span style={{ fontSize: 12, fontWeight: 400 }}>ر.س</span></div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{card.label}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: card.color }}>
              {filter === card.type ? "✓ يعرض هذا النوع — اضغط للإلغاء" : "اضغط لعرض التفاصيل"}
            </div>
          </div>
        ))}
      </div>

      {/* شريط الأدوات */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "الكل",       value: "all" },
            { label: "💰 إيرادات", value: "revenue" },
            { label: "📉 مصروفات", value: "expense" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{ padding: "7px 14px", borderRadius: 20, background: filter === f.value ? COLORS.accent : COLORS.cardBg, border: `1px solid ${filter === f.value ? COLORS.accent : COLORS.border}`, color: filter === f.value ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>
        {canEdit && (
          <button onClick={() => setAddModal(true)}
            style={{ padding: "9px 18px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            + إضافة
          </button>
        )}
      </div>

      {/* الجدول */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ background: COLORS.surface }}>
                {["النوع", "البيان", "المبلغ", "التاريخ", "ملاحظة", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 14px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: r.type === "revenue" ? `${COLORS.accent}05` : `${COLORS.danger}05` }}>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <Badge text={r.type === "revenue" ? "💰 إيراد" : "📉 مصروف"} color={r.type === "revenue" ? COLORS.accent : COLORS.danger} />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{r.label}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 14, fontWeight: 800, color: r.type === "revenue" ? COLORS.accent : COLORS.danger }}>
                    {r.type === "revenue" ? "+" : "-"}{formatNum(Number(r.amount))}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 12, color: COLORS.textSecondary }}>{r.date || "-"}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: COLORS.textSecondary }}>{r.note || "-"}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <button onClick={() => setDetailModal(r)}
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: COLORS.textSecondary }}>لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة */}
      {addModal && (
        <Modal title="➕ إضافة سجل مالي" onClose={() => setAddModal(false)}>
          <Field label="النوع" value={newRecord.type} onChange={v => setNewRecord(p => ({ ...p, type: v }))}
            options={[{ value: "revenue", label: "💰 إيراد" }, { value: "expense", label: "📉 مصروف" }]} />
          <Field label="البيان *" value={newRecord.label} onChange={v => setNewRecord(p => ({ ...p, label: v }))} placeholder="مثال: اشتراكات شهر يوليو" />
          <Field label="المبلغ (ر.س) *" value={newRecord.amount} onChange={v => setNewRecord(p => ({ ...p, amount: v }))} type="number" />
          <Field label="التاريخ" value={newRecord.date} onChange={v => setNewRecord(p => ({ ...p, date: v }))} placeholder="٢٠٢٦/٧/١" />
          <Field label="ملاحظة" value={newRecord.note} onChange={v => setNewRecord(p => ({ ...p, note: v }))} placeholder="تفاصيل إضافية" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addRecord} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
          </div>
        </Modal>
      )}

      {/* Modal تفاصيل */}
      {detailModal && (
        <Modal title="📋 تفاصيل السجل" onClose={() => setDetailModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { label: "النوع",   value: detailModal.type === "revenue" ? "💰 إيراد" : "📉 مصروف" },
              { label: "البيان",  value: detailModal.label },
              { label: "المبلغ",  value: `${formatNum(Number(detailModal.amount))} ر.س` },
              { label: "التاريخ", value: detailModal.date || "-" },
              { label: "ملاحظة", value: detailModal.note || "-" },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.label}</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
          {canEdit && (
            <button onClick={() => deleteRecord(detailModal.id)}
              style={{ width: "100%", padding: "12px", background: COLORS.danger, border: "none", color: "#fff", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>
              🗑️ حذف هذا السجل
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
