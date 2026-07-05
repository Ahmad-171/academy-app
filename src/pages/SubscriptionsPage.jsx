import { useState } from "react";
import { supabase } from "../lib/supabase";
import { validateDiscountCode, consumeDiscountCode } from "../lib/discounts";
import { COLORS } from "../constants/colors";
import { SUBSCRIPTION_PLANS } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { ToastMsg } from "../components/ui";

function addMonths(dateStr, months) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function SubscriptionsPage({ user, setUsers, plans = SUBSCRIPTION_PLANS }) {
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const plan = selected !== null ? plans[selected] : null;
  const finalPrice = plan ? Math.round(plan.price * (1 - (discount || 0) / 100)) : 0;

  const applyCode = async () => {
    if (!code.trim()) return;
    setChecking(true);
    const result = await validateDiscountCode(code);
    setChecking(false);
    if (result.error) { setDiscount(null); show(`⚠️ ${result.error}`, COLORS.warning); return; }
    setDiscount(result.percent);
    show(`✅ تم تطبيق خصم ${result.percent}٪`);
  };

  const subscribe = async () => {
    if (!plan || submitting) return;
    setSubmitting(true);
    const usedCode = discount ? code.trim().toUpperCase() : null;
    // إعادة التحقق لحظة الدفع — قد يكون الكود انتهى استخدامه بين التطبيق والدفع
    if (usedCode) {
      const recheck = await validateDiscountCode(usedCode);
      if (recheck.error) {
        setDiscount(null);
        show(`⚠️ ${recheck.error}`, COLORS.warning);
        setSubmitting(false);
        return;
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    const endDate = addMonths(today, plan.months);

    await supabase.from('subscription_payments').insert({
      user_id: user.id, plan_label: plan.label, months: plan.months,
      amount: finalPrice, discount_code: usedCode,
    });
    await supabase.from('users').update({ subscription_start: today, subscription_end: endDate, status: "نشط" }).eq('id', user.id);
    await consumeDiscountCode(usedCode);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, subscription_start: today, subscription_end: endDate, status: "نشط" } : u));
    setSubmitting(false);
    setDone(true);
  };

  if (done) return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent, marginBottom: 8 }}>تم تفعيل الاشتراك بنجاح!</div>
      <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>{plan?.label} — {finalPrice} ر.س</div>
      <button onClick={() => { setDone(false); setSelected(null); setCode(""); setDiscount(null); }}
        style={{ padding: "13px 36px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>العودة</button>
    </div>
  );

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>💳 الاشتراكات</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>اختر مدة الاشتراك المناسبة</div>

      <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: "repeat(3,1fr)", flexDirection: "column", gap: 12, marginBottom: 20, maxWidth: 760 }}>
        {plans.map((p, i) => (
          <div key={p.id} onClick={() => setSelected(i)} style={{ background: COLORS.cardBg, border: `2px solid ${selected === i ? COLORS.accent : COLORS.border}`, borderRadius: 16, padding: "20px", cursor: "pointer", textAlign: "center", boxShadow: selected === i ? `0 0 20px ${COLORS.accent}33` : "none" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8 }}>{p.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.accent }}>{p.price} <span style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 400 }}>ر.س</span></div>
          </div>
        ))}
      </div>

      {plan && (
        <div style={{ maxWidth: 480, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>كود الخصم (اختياري)</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="مثال: WELCOME10"
              style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 13, boxSizing: "border-box" }} />
            <button onClick={applyCode} disabled={checking} style={{ padding: "0 18px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>{checking ? "..." : "تطبيق"}</button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: COLORS.textSecondary }}>السعر الأصلي</span>
            <span style={{ color: COLORS.textPrimary }}>{plan.price} ر.س</span>
          </div>
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: COLORS.accent }}>الخصم ({discount}٪)</span>
              <span style={{ color: COLORS.accent }}>-{plan.price - finalPrice} ر.س</span>
            </div>
          )}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: 15 }}>الإجمالي</span>
            <span style={{ color: COLORS.accentGold, fontWeight: 900, fontSize: 22 }}>{finalPrice} ر.س</span>
          </div>

          <button onClick={subscribe} disabled={submitting}
            style={{ width: "100%", padding: "13px", borderRadius: 13, background: `linear-gradient(135deg,${COLORS.accent},#00a07a)`, border: "none", color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer" }}>
            {submitting ? "جاري التنفيذ..." : "✓ تفعيل الاشتراك"}
          </button>
        </div>
      )}
    </div>
  );
}
