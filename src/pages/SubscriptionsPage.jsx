import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";

const PAY_METHODS = ["مدى / Mada", "فيزا / Mastercard", "Apple Pay"];

export function SubscriptionsPage({ user, setUsers, membershipPlans }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [signed, setSigned] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isDesktop } = useWindowSize();

  const completeSubscription = async () => {
    if (payMethod === null || submitting) return;
    setSubmitting(true);
    const plan = membershipPlans[selected];
    await supabase.from('subscriptions').insert({
      user_id: user.id, plan: plan.name, price: plan.price, payment_method: PAY_METHODS[payMethod],
    });
    await supabase.from('users').update({ membership: plan.name }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, membership: plan.name } : u));
    setSubmitting(false);
    setDone(true);
  };

  if (done) return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent, marginBottom: 8 }}>تم الاشتراك بنجاح!</div>
      <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>مرحباً بك في عضوية {membershipPlans[selected]?.name}</div>
      <button onClick={() => { setDone(false); setStep(1); setSelected(null); setSigned(false); setPayMethod(null); }}
        style={{ padding: "13px 36px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>العودة</button>
    </div>
  );

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>الاشتراكات</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>اختر باقتك وأتمّ التسجيل</div>

      {/* شريط الخطوات */}
      <div style={{ display: "flex", gap: 4, marginBottom: 26, maxWidth: isDesktop ? 500 : "100%" }}>
        {["اختر الباقة", "العقد", "الدفع"].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: step > i ? COLORS.accent : COLORS.border, marginBottom: 5 }} />
            <div style={{ fontSize: 11, color: step > i ? COLORS.accent : COLORS.textSecondary, fontWeight: step > i ? 700 : 400 }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: "repeat(2,1fr)", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            {membershipPlans.map((m, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ background: m.bg, border: `2px solid ${selected === i ? m.color : m.color + "33"}`, borderRadius: 16, padding: "18px", cursor: "pointer", position: "relative", boxShadow: selected === i ? `0 0 20px ${m.color}44` : "none" }}>
                {m.popular && <div style={{ position: "absolute", top: -9, right: 14, background: m.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 30 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: m.color, fontWeight: 800, fontSize: 16 }}>{m.name}</div>
                      <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 2 }}>{m.features.length} مزايا</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.textPrimary }}>{m.price}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary }}>ر.س/شهر</div>
                  </div>
                </div>
                {m.features.map((f, j) => <div key={j} style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 5, display: "flex", gap: 5 }}><span style={{ color: m.color }}>✓</span>{f}</div>)}
              </div>
            ))}
          </div>
          <button onClick={() => selected !== null && setStep(2)}
            style={{ width: isDesktop ? 300 : "100%", padding: "14px", borderRadius: 13, background: selected !== null ? COLORS.accent : COLORS.surface, border: "none", color: selected !== null ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: selected !== null ? "pointer" : "not-allowed" }}>
            التالي: مراجعة العقد ←
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: isDesktop ? 580 : "100%" }}>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>📄 عقد الاشتراك</div>
            {["يلتزم المشترك بالحضور في المواعيد المحددة.", "يحق للأكاديمية إيقاف الاشتراك في حالة الإخلال بالنظام.", "لا يُسترد الاشتراك المدفوع إلا في حالات الإصابة الموثقة.", "يوافق المشترك على تصوير اللاعب لأغراض الأكاديمية.", "تسري هذه الشروط من تاريخ التوقيع.", "يلتزم ولي الأمر بالالتزام بأوقات الإحضار والاستلام.", "يحق للأكاديمية تعديل الجداول مع إشعار مسبق."].map((c, i) => (
              <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 14, borderRight: `2px solid ${COLORS.border}`, lineHeight: 1.7 }}>{c}</div>
            ))}
          </div>
          <div onClick={() => setSigned(!signed)} style={{ background: signed ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", marginBottom: 18 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: signed ? COLORS.accent : COLORS.surface, border: `2px solid ${signed ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {signed && <span style={{ color: "#000", fontSize: 14, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary }}>أوافق على جميع الشروط والأحكام وأوقّع إلكترونياً</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>رجوع</button>
            <button onClick={() => signed && setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 12, background: signed ? COLORS.accent : COLORS.surface, border: "none", color: signed ? "#000" : COLORS.textSecondary, fontWeight: 800, cursor: signed ? "pointer" : "not-allowed" }}>التالي ←</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: isDesktop ? 480 : "100%" }}>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>ملخص الطلب</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: COLORS.textSecondary }}>الباقة</span>
              <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{membershipPlans[selected]?.name} {membershipPlans[selected]?.icon}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: COLORS.textSecondary }}>المدة</span>
              <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>شهري</span>
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: 15 }}>الإجمالي</span>
              <span style={{ color: COLORS.accentGold, fontWeight: 900, fontSize: 22 }}>{membershipPlans[selected]?.price} ر.س</span>
            </div>
          </div>
          {[{ label: "مدى / Mada", icon: "💳", desc: "البطاقة المدفوعة مسبقاً" }, { label: "فيزا / Mastercard", icon: "💳", desc: "بطاقة الائتمان" }, { label: "Apple Pay", icon: "🍎", desc: "الدفع السريع" }].map((m, i) => (
            <div key={i} onClick={() => setPayMethod(i)} style={{ background: payMethod === i ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${payMethod === i ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "15px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{m.desc}</div>
              </div>
              {payMethod === i && <span style={{ color: COLORS.accent, fontSize: 18, fontWeight: 900 }}>✓</span>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 13, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>رجوع</button>
            <button onClick={completeSubscription} disabled={payMethod === null || submitting}
              style={{ flex: 2, padding: "13px", borderRadius: 13, background: payMethod !== null ? `linear-gradient(135deg,${COLORS.accent},#00a07a)` : COLORS.surface, border: "none", color: payMethod !== null ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: payMethod !== null ? "pointer" : "not-allowed" }}>
              {submitting ? "جاري التنفيذ..." : "✓ إتمام الدفع"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
