import { useState } from "react";
import { COLORS } from "../constants/colors";
import { DEFAULT_PAYMENT_INFO } from "../constants/data";

// صندوق السداد: يعرض المبلغ المستحق وطريقتي الدفع (كاش / تحويل) وبيانات الآيبان.
// يُستخدم في صفحتي الاشتراكات والعضويات. method يُرفع للأعلى عبر onMethod.
export function PaymentBox({ amount, paymentInfo, method, onMethod }) {
  const pay = { ...DEFAULT_PAYMENT_INFO, ...(paymentInfo || {}) };
  const [copied, setCopied] = useState(false);

  const copyIban = async () => {
    try { await navigator.clipboard.writeText(pay.iban); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* تجاهل */ }
  };

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 700 }}>المبلغ المستحق</span>
        <span style={{ color: COLORS.accentGold, fontWeight: 900, fontSize: 22 }}>{amount} ر.س</span>
      </div>

      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8, fontWeight: 700 }}>طريقة السداد</div>
      <div style={{ display: "flex", gap: 8, marginBottom: method === "transfer" ? 14 : 0 }}>
        {[["cash", "💵 كاش"], ["transfer", "🏦 تحويل بنكي"]].map(([m, lbl]) => (
          <button key={m} onClick={() => onMethod(m)} style={{
            flex: 1, padding: "11px", borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: "pointer",
            background: method === m ? COLORS.accent : COLORS.cardBg,
            border: `1px solid ${method === m ? COLORS.accent : COLORS.border}`,
            color: method === m ? "#000" : COLORS.textSecondary,
          }}>{lbl}</button>
        ))}
      </div>

      {method === "transfer" && (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>البنك</span>
            <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 700 }}>{pay.bank}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>اسم المستفيد</span>
            <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 700 }}>{pay.holder}</span>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>رقم الآيبان (IBAN)</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "10px 12px", fontSize: 13, color: COLORS.accent, fontWeight: 800, letterSpacing: 1, direction: "ltr", textAlign: "left", overflowX: "auto" }}>{pay.iban}</div>
            <button onClick={copyIban} style={{ padding: "10px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "✓ نُسخ" : "نسخ"}</button>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 10, lineHeight: 1.7 }}>حوّل المبلغ ثم فعّل — واحتفظ بإيصال التحويل لتقديمه للإدارة.</div>
        </div>
      )}
    </div>
  );
}
