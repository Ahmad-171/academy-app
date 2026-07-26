import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { memberships as DEFAULT_MEMBERSHIPS, DEFAULT_PAYMENT_INFO } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { ToastMsg } from "../components/ui";
import { PaymentBox } from "../components/PaymentBox";

export function MembershipsPage({ user, memberships = DEFAULT_MEMBERSHIPS, paymentInfo = DEFAULT_PAYMENT_INFO }) {
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();
  const [selected, setSelected] = useState(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isMine = (m) => user.membership === m.name;
  // اللاعب وولي الأمر يقدران يختاران العضوية
  const canChoose = user.role === "لاعب" || user.role === "ولي أمر";
  const chosen = selected != null ? memberships[selected] : null;

  const choose = async () => {
    if (!chosen || submitting) return;
    setSubmitting(true);
    // إنشاء «طلب عضوية» بحالة قيد المراجعة — لا يُفعَّل إلا بعد موافقة الإدارة
    const { error } = await supabase.from('membership_requests').insert({
      user_id: user.id, membership_name: chosen.name, amount: chosen.price || 0, method: payMethod, status: 'pending',
    });
    setSubmitting(false);
    if (error) { show(`⚠️ تعذّر إرسال الطلب: ${error.message}`, COLORS.danger); return; }
    setDone(true);
  };

  if (done) return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>📨</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.accent, marginBottom: 8 }}>تم إرسال طلب العضوية</div>
      <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 }}>عضوية {chosen?.name}{chosen?.price > 0 ? ` — ${chosen.price} ر.س · ${payMethod === "transfer" ? "تحويل بنكي" : "كاش"}` : ""}</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, maxWidth: 360, margin: "0 auto 24px" }}>سيصل الطلب لإدارة الأكاديمية لتفعيله. تظهر عضويتك فور الموافقة.</div>
      <button onClick={() => { setDone(false); setSelected(null); setPayMethod("cash"); }}
        style={{ padding: "13px 36px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>العودة</button>
    </div>
  );

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>💎 العضويات</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>{canChoose ? "اختر مستوى العضوية المناسب لك" : "مزايا كل مستوى عضوية بالأكاديمية"}</div>

      <div style={{ display: isDesktop ? "grid" : "flex", gridTemplateColumns: "repeat(3,1fr)", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {memberships.map((m, i) => (
          <div key={i} onClick={() => canChoose && setSelected(i)} style={{ background: m.bg, border: `2px solid ${isMine(m) || selected === i ? m.color : m.color + "33"}`, borderRadius: 18, padding: "22px", position: "relative", cursor: canChoose ? "pointer" : "default", boxShadow: selected === i ? `0 0 20px ${m.color}55` : "none" }}>
            {m.popular && <div style={{ position: "absolute", top: -10, right: 14, background: m.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>الأكثر طلباً</div>}
            {isMine(m) && <div style={{ position: "absolute", top: -10, left: 14, background: COLORS.accent, color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>عضويتك الحالية</div>}
            <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ color: m.color, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>عضوية {m.name}</div>
            {m.desc && <div style={{ fontSize: 12, color: "#ffffffcc", marginBottom: 6 }}>{m.desc}</div>}
            {m.price > 0 && <div style={{ fontSize: 16, fontWeight: 900, color: m.color, marginBottom: 10 }}>{m.price} <span style={{ fontSize: 11, fontWeight: 400 }}>ر.س</span></div>}
            {(m.features || []).map((f, j) => (
              <div key={j} style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8, display: "flex", gap: 6 }}>
                <span style={{ color: m.color }}>✓</span>{f}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* تأكيد اختيار العضوية (للاعب/ولي الأمر) */}
      {canChoose && chosen && (
        <div style={{ maxWidth: 480, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>اختيار عضوية {chosen.name}</div>
          {chosen.price > 0 && <PaymentBox amount={chosen.price} paymentInfo={paymentInfo} method={payMethod} onMethod={setPayMethod} />}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "13px", borderRadius: 13, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>إلغاء</button>
            <button onClick={choose} disabled={submitting} style={{ flex: 2, padding: "13px", borderRadius: 13, background: `linear-gradient(135deg,${COLORS.accent},#00a07a)`, border: "none", color: "#000", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>{submitting ? "جاري الإرسال..." : "📨 إرسال طلب العضوية"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
