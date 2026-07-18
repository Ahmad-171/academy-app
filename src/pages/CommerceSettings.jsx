import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useToast } from "../hooks/useToast";
import { ToastMsg } from "../components/ui";

const box = { background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, marginBottom: 20 };
const input = { width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 9, padding: "9px 11px", fontSize: 13, boxSizing: "border-box" };
const lbl = { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4, fontWeight: 600 };
const saveBtn = { padding: "9px 18px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" };
const title = { fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 };

// محرّر تصنيفات (شرائح مع إضافة/حذف)
function ChipsEditor({ items, onSave, placeholder }) {
  const [list, setList] = useState(items || []);
  const [val, setVal] = useState("");
  const add = () => { const v = val.trim(); if (!v || list.includes(v)) return; setList([...list, v]); setVal(""); };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {list.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "6px 12px", fontSize: 12, color: COLORS.textPrimary }}>
            {c}
            <button onClick={() => setList(list.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", fontSize: 13, padding: 0 }}>✕</button>
          </span>
        ))}
        {list.length === 0 && <span style={{ fontSize: 12, color: COLORS.textSecondary }}>لا توجد تصنيفات</span>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder={placeholder} style={{ ...input, flex: 1 }} />
        <button onClick={add} style={{ ...saveBtn, background: COLORS.surface, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>+ إضافة</button>
        <button onClick={() => onSave(list)} style={saveBtn}>💾 حفظ</button>
      </div>
    </div>
  );
}

export function CommerceSettings({
  subscriptionPlans = [], saveSubscriptionPlans,
  membershipsList = [], saveMembershipsList,
  storeCategories = [], saveStoreCategories,
  subCategories = [], saveSubCategories,
  branchInfo = {}, saveBranchInfo,
  paymentInfo = {}, savePaymentInfo,
}) {
  const { toast, show } = useToast();
  const [plans, setPlans] = useState(subscriptionPlans);
  const [mems, setMems] = useState(membershipsList);
  const [branch, setBranch] = useState(branchInfo);
  const [pay, setPay] = useState(paymentInfo);

  const setPlan = (i, k, v) => setPlans(plans.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const addPlan = () => setPlans([...plans, { id: `p${Date.now()}`, label: "اشتراك جديد", months: 1, price: 0, desc: "", category: subCategories[0] || "عام" }]);
  const delPlan = (i) => setPlans(plans.filter((_, j) => j !== i));
  const savePlans = () => { saveSubscriptionPlans(plans.map(p => ({ ...p, price: Number(p.price) || 0, months: Number(p.months) || 1 }))); show("✅ تم حفظ الاشتراكات"); };

  const setMem = (i, k, v) => setMems(mems.map((m, j) => j === i ? { ...m, [k]: v } : m));
  const addMem = () => setMems([...mems, { name: "عضوية جديدة", color: "#c0c0c0", bg: "linear-gradient(135deg,#2a2a3a,#4a4a6a)", icon: "⭐", price: 0, desc: "", features: [] }]);
  const delMem = (i) => setMems(mems.filter((_, j) => j !== i));
  const saveMems = () => { saveMembershipsList(mems.map(m => ({ ...m, price: Number(m.price) || 0 }))); show("✅ تم حفظ العضويات"); };

  return (
    <div>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {/* الاشتراكات */}
      <div style={box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={title}>💳 الاشتراكات</div>
          <button onClick={addPlan} style={{ ...saveBtn, background: COLORS.surface, color: COLORS.accent, border: `1px solid ${COLORS.accent}55` }}>+ اشتراك</button>
        </div>
        {plans.map((p, i) => (
          <div key={p.id || i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><div style={lbl}>الاسم</div><input value={p.label} onChange={e => setPlan(i, "label", e.target.value)} style={input} /></div>
              <div><div style={lbl}>السعر (ر.س)</div><input type="number" value={p.price} onChange={e => setPlan(i, "price", e.target.value)} style={input} /></div>
              <div><div style={lbl}>عدد الأشهر</div><input type="number" value={p.months} onChange={e => setPlan(i, "months", e.target.value)} style={input} /></div>
              <div><div style={lbl}>التصنيف</div>
                <select value={p.category || "عام"} onChange={e => setPlan(i, "category", e.target.value)} style={input}>
                  {[...new Set([...(subCategories || []), p.category || "عام"])].filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={lbl}>العبارة الوصفية (مثال: ١٢ حصة تدريبية)</div>
            <input value={p.desc || ""} onChange={e => setPlan(i, "desc", e.target.value)} placeholder="١٢ حصة تدريبية" style={input} />
            <button onClick={() => delPlan(i)} style={{ marginTop: 8, background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️ حذف</button>
          </div>
        ))}
        <button onClick={savePlans} style={{ ...saveBtn, width: "100%", marginTop: 6 }}>💾 حفظ الاشتراكات</button>
      </div>

      {/* تصنيفات الاشتراكات */}
      <div style={box}>
        <div style={{ ...title, marginBottom: 12 }}>🏷️ تصنيفات الاشتراكات</div>
        <ChipsEditor items={subCategories} onSave={(v) => { saveSubCategories(v); show("✅ تم حفظ تصنيفات الاشتراكات"); }} placeholder="اسم التصنيف" />
      </div>

      {/* العضويات */}
      <div style={box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={title}>💎 العضويات</div>
          <button onClick={addMem} style={{ ...saveBtn, background: COLORS.surface, color: COLORS.accentGold, border: `1px solid ${COLORS.accentGold}55` }}>+ عضوية</button>
        </div>
        {mems.map((m, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><div style={lbl}>الأيقونة</div><input value={m.icon || ""} onChange={e => setMem(i, "icon", e.target.value)} style={{ ...input, textAlign: "center", fontSize: 18 }} /></div>
              <div><div style={lbl}>الاسم</div><input value={m.name} onChange={e => setMem(i, "name", e.target.value)} style={input} /></div>
              <div><div style={lbl}>السعر (ر.س)</div><input type="number" value={m.price || 0} onChange={e => setMem(i, "price", e.target.value)} style={input} /></div>
            </div>
            <div style={lbl}>الوصف المختصر</div>
            <input value={m.desc || ""} onChange={e => setMem(i, "desc", e.target.value)} placeholder="وصف العضوية" style={{ ...input, marginBottom: 8 }} />
            <div style={lbl}>المزايا (ميزة في كل سطر)</div>
            <textarea value={(m.features || []).join("\n")} onChange={e => setMem(i, "features", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} rows={3} style={{ ...input, resize: "vertical", lineHeight: 1.8 }} />
            <button onClick={() => delMem(i)} style={{ marginTop: 8, background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️ حذف</button>
          </div>
        ))}
        <button onClick={saveMems} style={{ ...saveBtn, width: "100%", marginTop: 6 }}>💾 حفظ العضويات</button>
      </div>

      {/* تصنيفات المتجر */}
      <div style={box}>
        <div style={{ ...title, marginBottom: 12 }}>🛒 تصنيفات المتجر</div>
        <ChipsEditor items={storeCategories} onSave={(v) => { saveStoreCategories(v); show("✅ تم حفظ تصنيفات المتجر"); }} placeholder="اسم التصنيف" />
      </div>

      {/* معلومات الأكاديمية */}
      <div style={box}>
        <div style={{ ...title, marginBottom: 12 }}>📍 معلومات الأكاديمية</div>
        {[["place", "المكان"], ["days", "الأيام"], ["time", "الوقت"]].map(([k, t]) => (
          <div key={k} style={{ marginBottom: 10 }}><div style={lbl}>{t}</div>
            <input value={branch[k] || ""} onChange={e => setBranch({ ...branch, [k]: e.target.value })} style={input} /></div>
        ))}
        <button onClick={() => { saveBranchInfo(branch); show("✅ تم حفظ معلومات الأكاديمية"); }} style={{ ...saveBtn, width: "100%", marginTop: 4 }}>💾 حفظ</button>
      </div>

      {/* بيانات السداد */}
      <div style={box}>
        <div style={{ ...title, marginBottom: 12 }}>🏦 بيانات السداد (التحويل البنكي)</div>
        {[["bank", "اسم البنك"], ["holder", "اسم المستفيد"], ["iban", "رقم الآيبان (IBAN)"]].map(([k, t]) => (
          <div key={k} style={{ marginBottom: 10 }}><div style={lbl}>{t}</div>
            <input value={pay[k] || ""} onChange={e => setPay({ ...pay, [k]: e.target.value })} style={{ ...input, ...(k === "iban" ? { direction: "ltr", textAlign: "left" } : {}) }} /></div>
        ))}
        <button onClick={() => { savePaymentInfo(pay); show("✅ تم حفظ بيانات السداد"); }} style={{ ...saveBtn, width: "100%", marginTop: 4 }}>💾 حفظ</button>
      </div>
    </div>
  );
}
