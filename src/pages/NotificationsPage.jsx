import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { isManager } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Modal, Field, ToastMsg } from "../components/ui";

const TARGET_ROLES = {
  "الكل": ["مدير", "مدرب", "لاعب", "ولي أمر"],
  "اللاعبين": ["لاعب"],
  "المدربين": ["مدرب"],
  "أولياء الأمور": ["ولي أمر"],
};
// يحوّل مصفوفة الأدوار المخزّنة إلى اسم الفئة المستهدفة لعرضها في نموذج التعديل
const rolesToTarget = (roles = []) => {
  const found = Object.entries(TARGET_ROLES).find(([, r]) => r.length === roles.length && r.every(x => roles.includes(x)));
  return found ? found[0] : "الكل";
};

const EMPTY = { msg: "", type: "training", target: "الكل", show_on_home: false };

export function NotificationsPage({ user, notifications, setNotifications }) {
  const [formModal, setFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canManage = isManager(user) || user.permissions?.sendNotifications;
  const icons  = { match: "⚽", absence: "❌", payment: "💳", award: "⭐", training: "🏃", general: "📢" };
  const colors = { match: COLORS.warning, absence: COLORS.danger, payment: COLORS.accentBlue, award: COLORS.accentGold, training: COLORS.accent, general: COLORS.purple };

  const myNotifs = notifications.filter(n => n.roles.includes(user.role));
  const unread   = myNotifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY); setFormModal(true); };
  const openEdit = (n) => {
    setEditId(n.id);
    setForm({ msg: n.msg, type: n.type, target: rolesToTarget(n.roles), show_on_home: !!n.show_on_home });
    setFormModal(true);
  };

  const saveForm = async () => {
    if (!form.msg.trim()) { show("⚠️ أدخل نص الرسالة", COLORS.warning); return; }
    const roles = TARGET_ROLES[form.target] || TARGET_ROLES["الكل"];

    if (editId) {
      const { error } = await supabase.from('notifications')
        .update({ type: form.type, msg: form.msg, roles, show_on_home: form.show_on_home })
        .eq('id', editId);
      if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
      setNotifications(prev => prev.map(n => n.id === editId ? { ...n, type: form.type, msg: form.msg, roles, show_on_home: form.show_on_home } : n));
      show("✅ تم حفظ التعديلات");
    } else {
      const { data, error } = await supabase.from('notifications').insert({
        type: form.type, msg: form.msg, time: "الآن", read: false, roles, sender: user.name, show_on_home: form.show_on_home,
      }).select().single();
      if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
      if (data) setNotifications(prev => [{ ...data, roles: data.roles || [] }, ...prev]);
      show("✅ تم النشر");
    }
    setForm(EMPTY);
    setEditId(null);
    setFormModal(false);
  };

  const deleteNotif = async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setNotifications(prev => prev.filter(n => n.id !== id));
    show("🗑️ تم الحذف", COLORS.danger);
  };

  const toggleHome = async (n) => {
    const next = !n.show_on_home;
    const { error } = await supabase.from('notifications').update({ show_on_home: next }).eq('id', n.id);
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, show_on_home: next } : x));
    show(next ? "📌 تظهر الآن في الرئيسية" : "أُزيلت من الرئيسية");
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>📢 الفعاليات والرسائل</div>
          {unread > 0 && <div style={{ fontSize: 12, color: COLORS.danger, marginTop: 2 }}>{unread} غير مقروء</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canManage && (
            <button onClick={openAdd} style={{ padding: "8px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>➕ إضافة</button>
          )}
          <button onClick={markAllRead} style={{ padding: "8px 14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>قراءة الكل</button>
        </div>
      </div>

      <div style={{ maxWidth: isDesktop ? 700 : "100%", margin: "0 auto" }}>
        {myNotifs.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🔔</div>
            <div style={{ fontSize: 15 }}>لا توجد فعاليات أو رسائل</div>
          </div>
        )}
        {myNotifs.map(n => (
          <div key={n.id} style={{ background: n.read ? COLORS.cardBg : `${colors[n.type] || COLORS.accent}08`, border: `1px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent) + "33"}`, borderRight: `4px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent)}`, borderRadius: 14, padding: "15px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${colors[n.type] || COLORS.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icons[n.type] || "📢"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{n.msg}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{n.time}</span>
                {n.sender && <span style={{ fontSize: 11, color: COLORS.accent }}>· من: {n.sender}</span>}
                {n.show_on_home && <span style={{ fontSize: 10, color: COLORS.accentGold, background: COLORS.accentGold + "18", border: `1px solid ${COLORS.accentGold}44`, borderRadius: 6, padding: "1px 7px" }}>📌 في الرئيسية</span>}
              </div>
              {canManage && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button onClick={() => toggleHome(n)} style={{ padding: "5px 11px", background: n.show_on_home ? COLORS.accentGold + "22" : COLORS.surface, border: `1px solid ${n.show_on_home ? COLORS.accentGold + "55" : COLORS.border}`, color: n.show_on_home ? COLORS.accentGold : COLORS.textSecondary, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{n.show_on_home ? "📌 إزالة من الرئيسية" : "📌 إظهار في الرئيسية"}</button>
                  <button onClick={() => openEdit(n)} style={{ padding: "5px 11px", background: COLORS.accentBlue + "22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>
                  <button onClick={() => deleteNotif(n.id)} style={{ padding: "5px 11px", background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️ حذف</button>
                </div>
              )}
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[n.type] || COLORS.accent, flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>

      {formModal && (
        <Modal title={editId ? "✏️ تعديل" : "➕ إضافة فعالية / رسالة"} onClose={() => setFormModal(false)}>
          <Field label="النوع" value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))}
            options={[{ value: "training", label: "🏃 تدريب" }, { value: "match", label: "⚽ مباراة" }, { value: "general", label: "📢 عام" }, { value: "award", label: "⭐ مكافأة" }, { value: "payment", label: "💳 دفع" }]} />
          <Field label="المستهدفون" value={form.target} onChange={v => setForm(p => ({ ...p, target: v }))}
            options={["الكل", "اللاعبين", "المدربين", "أولياء الأمور"]} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>النص</div>
            <textarea value={form.msg} onChange={e => setForm(p => ({ ...p, msg: e.target.value }))} rows={3} placeholder="اكتب نص الفعالية أو الرسالة..."
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          {/* خيار الإظهار في الصفحة الرئيسية */}
          <div onClick={() => setForm(p => ({ ...p, show_on_home: !p.show_on_home }))}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginBottom: 16, background: form.show_on_home ? COLORS.accent + "15" : COLORS.surface, border: `1px solid ${form.show_on_home ? COLORS.accent + "55" : COLORS.border}`, borderRadius: 11, cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: form.show_on_home ? COLORS.accent : COLORS.surface, border: `1px solid ${form.show_on_home ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {form.show_on_home && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: form.show_on_home ? COLORS.accent : COLORS.textPrimary }}>📌 إظهار في الصفحة الرئيسية</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>إن لم تُفعّل، تظهر فقط في صفحة الفعاليات والرسائل</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setFormModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveForm} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>{editId ? "✅ حفظ" : "📤 نشر"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
