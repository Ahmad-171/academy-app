import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Modal, Field, ToastMsg } from "../components/ui";

export function NotificationsPage({ user, notifications, setNotifications }) {
  const [sendModal, setSendModal] = useState(false);
  const [newNotif, setNewNotif] = useState({ msg: "", type: "training", target: "الكل" });
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canSend = user.role === "مدير" || user.permissions?.sendNotifications;
  const icons   = { match: "⚽", absence: "❌", payment: "💳", award: "⭐", training: "🏃", general: "📢" };
  const colors  = { match: COLORS.warning, absence: COLORS.danger, payment: COLORS.accentBlue, award: COLORS.accentGold, training: COLORS.accent, general: COLORS.purple };

  const myNotifs = notifications.filter(n => n.roles.includes(user.role));
  const unread   = myNotifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sendNotification = async () => {
    if (!newNotif.msg.trim()) { show("⚠️ أدخل نص الإشعار", COLORS.warning); return; }
    const targetRoles = newNotif.target === "الكل"
      ? ["مدير", "مدرب", "لاعب", "ولي أمر"]
      : newNotif.target === "اللاعبين"
      ? ["لاعب"]
      : newNotif.target === "المدربين"
      ? ["مدرب"]
      : ["ولي أمر"];

    const { data } = await supabase.from('notifications').insert({
      type: newNotif.type,
      msg: newNotif.msg,
      time: "الآن",
      read: false,
      roles: targetRoles,
      sender: user.name,
    }).select().single();

    if (data) setNotifications(prev => [{ ...data, roles: data.roles || [] }, ...prev]);
    setNewNotif({ msg: "", type: "training", target: "الكل" });
    setSendModal(false);
    show("✅ تم إرسال الإشعار");
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
          {canSend && (
            <button onClick={() => setSendModal(true)} style={{ padding: "8px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📤 إرسال</button>
          )}
          <button onClick={markAllRead} style={{ padding: "8px 14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>قراءة الكل</button>
        </div>
      </div>

      <div style={{ maxWidth: isDesktop ? 700 : "100%", margin: "0 auto" }}>
        {myNotifs.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🔔</div>
            <div style={{ fontSize: 15 }}>لا توجد إشعارات</div>
          </div>
        )}
        {myNotifs.map(n => (
          <div key={n.id} style={{ background: n.read ? COLORS.cardBg : `${colors[n.type] || COLORS.accent}08`, border: `1px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent) + "33"}`, borderRight: `4px solid ${n.read ? COLORS.border : (colors[n.type] || COLORS.accent)}`, borderRadius: 14, padding: "15px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${colors[n.type] || COLORS.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icons[n.type] || "📢"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{n.msg}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{n.time}</span>
                {n.sender && <span style={{ fontSize: 11, color: COLORS.accent }}>· من: {n.sender}</span>}
              </div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[n.type] || COLORS.accent, flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>

      {sendModal && (
        <Modal title="📤 إرسال إشعار" onClose={() => setSendModal(false)}>
          <Field label="نوع الإشعار" value={newNotif.type} onChange={v => setNewNotif(p => ({ ...p, type: v }))}
            options={[{ value: "training", label: "🏃 تدريب" }, { value: "match", label: "⚽ مباراة" }, { value: "general", label: "📢 عام" }, { value: "award", label: "⭐ مكافأة" }]} />
          <Field label="المستهدفون" value={newNotif.target} onChange={v => setNewNotif(p => ({ ...p, target: v }))}
            options={["الكل", "اللاعبين", "المدربين", "أولياء الأمور"]} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>نص الإشعار</div>
            <textarea value={newNotif.msg} onChange={e => setNewNotif(p => ({ ...p, msg: e.target.value }))} rows={3} placeholder="اكتب نص الإشعار..."
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSendModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={sendNotification} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>📤 إرسال</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
