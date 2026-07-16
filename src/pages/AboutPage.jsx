import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { BRAND_NAME } from "../constants/brand";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { ToastMsg } from "../components/ui";

export const DEFAULT_TERMS = [
  "يلتزم المشترك بالحضور في المواعيد المحددة من الأكاديمية.",
  "يحق للأكاديمية إيقاف الاشتراك في حالة الإخلال بالنظام الداخلي.",
  "لا يُسترد الاشتراك المدفوع إلا في حالات الإصابة الموثقة طبيًا.",
  "يوافق المشترك على تصوير اللاعب لأغراض الأكاديمية والتسويق.",
  "يلتزم ولي الأمر بالالتزام بأوقات الإحضار والاستلام.",
  "يحق للأكاديمية تعديل الجداول والمواعيد مع إشعار مسبق.",
  "لا يُفعَّل الحساب بشكل كامل إلا بعد التوقيع الإلكتروني على هذه الشروط.",
];

export const DEFAULT_PRIVACY = [
  "نجمع البيانات اللازمة فقط لإدارة العضوية: الاسم، رقم الهوية، رقم الجوال، تاريخ الميلاد، وبيانات ولي الأمر.",
  "تُستخدم البيانات الصحية لضمان سلامة اللاعب أثناء التدريب، ولا يطّلع عليها إلا الإدارة والطاقم الطبي.",
  "لا نبيع أو نشارك بياناتك مع أي جهة خارجية لأغراض تسويقية.",
  "كلمات السر محفوظة بشكل مشفّر عبر نظام مصادقة آمن، ولا يستطيع أحد الاطلاع عليها.",
  "يحق لك طلب تعديل أو حذف بياناتك بالتواصل مع إدارة الأكاديمية.",
  "تُحفظ بيانات اللاعب طوال مدة العضوية وتُحذف عند الطلب أو بعد انتهاء العلاقة بفترة معقولة.",
];

// محرّر بسيط لقائمة نصوص (بند لكل سطر) — يظهر لحساب المبرمج فقط
function EditableList({ title, subtitle, items, accent, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const start = () => { setDraft((items || []).join("\n")); setEditing(true); };
  const save = () => { onSave(draft.split("\n").map(s => s.trim()).filter(Boolean)); setEditing(false); };
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: subtitle ? 6 : 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{title}</div>
        {canEdit && !editing && <button onClick={start} style={{ background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>{subtitle}</div>}
      {editing ? (
        <>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>بند واحد في كل سطر:</div>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={8}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px", fontSize: 13, resize: "vertical", boxSizing: "border-box", lineHeight: 1.9 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "9px", borderRadius: 9, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>إلغاء</button>
            <button onClick={save} style={{ flex: 2, padding: "9px", borderRadius: 9, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>💾 حفظ</button>
          </div>
        </>
      ) : (
        (items || []).map((t, i) => (
          <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, paddingRight: 14, borderRight: `2px solid ${accent}`, lineHeight: 1.7 }}>{t}</div>
        ))
      )}
    </div>
  );
}

export function AboutPage({ user, setUsers, terms, privacy, saveTerms, savePrivacy }) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const TERMS = terms && terms.length ? terms : DEFAULT_TERMS;
  const PRIVACY = privacy && privacy.length ? privacy : DEFAULT_PRIVACY;
  const canEditAbout = user.role === "مبرمج";
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
        <EditableList title="📄 شروط الانضمام والعقد" items={TERMS} accent={COLORS.border} canEdit={canEditAbout} onSave={(v) => { saveTerms?.(v); show("✅ تم حفظ الشروط"); }} />

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
        <div style={{ marginTop: 20 }}>
          <EditableList title="🔒 سياسة الخصوصية وحماية البيانات" subtitle="كيف نجمع بياناتك ونحميها" items={PRIVACY} accent={COLORS.accent + "55"} canEdit={canEditAbout} onSave={(v) => { savePrivacy?.(v); show("✅ تم حفظ سياسة الخصوصية"); }} />
        </div>
      </div>
    </div>
  );
}
