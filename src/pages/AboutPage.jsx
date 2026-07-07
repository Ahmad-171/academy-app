import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { BRAND_NAME } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { ToastMsg } from "../components/ui";

const TERMS = [
  "يلتزم المشترك بالحضور في المواعيد المحددة من الأكاديمية.",
  "يحق للأكاديمية إيقاف الاشتراك في حالة الإخلال بالنظام الداخلي.",
  "لا يُسترد الاشتراك المدفوع إلا في حالات الإصابة الموثقة طبيًا.",
  "يوافق المشترك على تصوير اللاعب لأغراض الأكاديمية والتسويق.",
  "يلتزم ولي الأمر بالالتزام بأوقات الإحضار والاستلام.",
  "يحق للأكاديمية تعديل الجداول والمواعيد مع إشعار مسبق.",
  "لا يُفعَّل الحساب بشكل كامل إلا بعد التوقيع الإلكتروني على هذه الشروط.",
];

const PRIVACY = [
  "نجمع البيانات اللازمة فقط لإدارة العضوية: الاسم، رقم الهوية، رقم الجوال، تاريخ الميلاد، وبيانات ولي الأمر.",
  "تُستخدم البيانات الصحية لضمان سلامة اللاعب أثناء التدريب، ولا يطّلع عليها إلا الإدارة والطاقم الطبي.",
  "لا نبيع أو نشارك بياناتك مع أي جهة خارجية لأغراض تسويقية.",
  "كلمات السر محفوظة بشكل مشفّر عبر نظام مصادقة آمن، ولا يستطيع أحد الاطلاع عليها.",
  "يحق لك طلب تعديل أو حذف بياناتك بالتواصل مع إدارة الأكاديمية.",
  "تُحفظ بيانات اللاعب طوال مدة العضوية وتُحذف عند الطلب أو بعد انتهاء العلاقة بفترة معقولة.",
];

export function AboutPage({ user, setUsers }) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const signed = !!user.contract_signed;

  const sign = async () => {
    if (!checked || submitting) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    await supabase.from('users').update({ contract_signed: true, contract_signed_at: now }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, contract_signed: true, contract_signed_at: now } : u));
    setSubmitting(false);
    show("✅ تم توقيع العقد وتفعيل الحساب بالكامل");
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>ℹ️ حول {BRAND_NAME}</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>شروط الانضمام وعقد الاشتراك</div>

      <div style={{ maxWidth: 640 }}>
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>📄 شروط الانضمام والعقد</div>
          {TERMS.map((t, i) => (
            <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 14, borderRight: `2px solid ${COLORS.border}`, lineHeight: 1.7 }}>{t}</div>
          ))}
        </div>

        {signed ? (
          <div style={{ background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}44`, borderRadius: 13, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ color: COLORS.accent, fontWeight: 800, fontSize: 14 }}>تم التوقيع — الحساب مفعّل بالكامل</div>
              {user.contract_signed_at && <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 2 }}>بتاريخ {new Date(user.contract_signed_at).toLocaleDateString("ar-SA")}</div>}
            </div>
          </div>
        ) : (
          <>
            <div onClick={() => setChecked(!checked)} style={{ background: checked ? `${COLORS.accent}15` : COLORS.cardBg, border: `2px solid ${checked ? COLORS.accent : COLORS.border}`, borderRadius: 13, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", marginBottom: 18 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: checked ? COLORS.accent : COLORS.surface, border: `2px solid ${checked ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {checked && <span style={{ color: "#000", fontSize: 14, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textPrimary }}>أوافق على جميع الشروط والأحكام وأوقّع إلكترونياً</div>
            </div>
            <button onClick={sign} disabled={!checked || submitting}
              style={{ width: "100%", padding: "13px", borderRadius: 13, background: checked ? COLORS.accent : COLORS.surface, border: "none", color: checked ? "#000" : COLORS.textSecondary, fontWeight: 900, fontSize: 15, cursor: checked ? "pointer" : "not-allowed" }}>
              {submitting ? "جاري التنفيذ..." : "✍️ توقيع العقد وتفعيل الحساب"}
            </button>
          </>
        )}

        {/* سياسة الخصوصية وحماية البيانات */}
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 6 }}>🔒 سياسة الخصوصية وحماية البيانات</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>كيف نجمع بياناتك ونحميها</div>
          {PRIVACY.map((t, i) => (
            <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 14, borderRight: `2px solid ${COLORS.accent}55`, lineHeight: 1.7 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
