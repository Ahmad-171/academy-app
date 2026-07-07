import { useState } from "react";
import { supabase } from "../lib/supabase";
import { createAccount } from "../lib/auth";
import { COLORS } from "../constants/colors";
import { PLAYER_CATEGORIES } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Avatar, Badge, Modal, Field, ToastMsg } from "../components/ui";

const EMPTY_PLAYER = {
  name: "", id: "", password: "", phone: "",
  birthDate: "", parentName: "", parentPhone: "",
  position: "-", membershipNumber: "", category: PLAYER_CATEGORIES[0],
  subscriptionStart: "", subscriptionEnd: "",
  previousInjuries: "لا يوجد",
};

export function PlayersRegistryPage({ user, users, setUsers, loadData }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PLAYER);
  const [editId, setEditId] = useState(null);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canEdit = user.role === "مدير" || user.permissions?.editData;

  const players = users.filter(u => u.role === "لاعب").filter(p =>
    !search || p.name.includes(search) || p.id.includes(search) || (p.membershipNumber || p.membership_number || "").includes(search)
  );

  const openAdd = () => { setForm(EMPTY_PLAYER); setEditId(null); setFormModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, id: p.id, password: "", phone: p.phone || "",
      birthDate: p.birth_date || "", parentName: p.parent_name || "", parentPhone: p.parent_phone || "",
      position: p.position || "-", membershipNumber: p.membership_number || "", category: p.category || PLAYER_CATEGORIES[0],
      subscriptionStart: p.subscription_start || "", subscriptionEnd: p.subscription_end || "",
      previousInjuries: p.medical?.injuries || "لا يوجد",
    });
    setEditId(p.id);
    setFormModal(true);
  };

  const savePlayer = async () => {
    if (!form.name.trim() || !form.id.trim()) {
      show("⚠️ الاسم ورقم الهوية مطلوبان", COLORS.warning); return;
    }
    if (!/^\d{10,}$/.test(form.id.trim())) {
      show("⚠️ رقم الهوية يجب أن يكون أرقامًا (10 خانات على الأقل)", COLORS.warning); return;
    }
    if (form.phone && !/^0?5\d{8}$/.test(form.phone.replace(/\s/g, ""))) {
      show("⚠️ رقم الجوال غير صحيح (مثال: 05xxxxxxxx)", COLORS.warning); return;
    }

    const fields = {
      name: form.name,
      phone: form.phone,
      birth_date: form.birthDate,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
      position: form.position || "-",
      membership_number: form.membershipNumber,
      category: form.category,
      subscription_start: form.subscriptionStart,
      subscription_end: form.subscriptionEnd,
    };

    if (editId) {
      const player = users.find(u => u.id === editId);
      await supabase.from('users').update({
        ...fields,
        medical: { ...(player?.medical || {}), injuries: form.previousInjuries },
      }).eq('id', editId);
      show("✅ تم تحديث بيانات اللاعب");
    } else {
      if (!form.password.trim() || form.password.trim().length < 6) {
        show("⚠️ كلمة السر مطلوبة (6 خانات على الأقل)", COLORS.warning); return;
      }
      if (users.find(u => u.id === form.id)) {
        show("⚠️ رقم الهوية مستخدم مسبقاً", COLORS.warning); return;
      }
      const { error } = await createAccount({
        id: form.id.trim(), password: form.password.trim(),
        profile: {
          role: "لاعب", custom_role: "لاعب",
          ...fields, membership: "-", status: "نشط", points: 0, attendance: 0,
          permissions: { editData: false },
          medical: { health: "جيدة", injuries: form.previousInjuries, allergies: "لا يوجد", medications: "لا يوجد" },
          ratings: { speed: 70, passing: 70, shooting: 70, defense: 70, spirit: 70 },
          attendance_log: [],
        },
      });
      if (error) { show(`⚠️ خطأ: ${error}`, COLORS.danger); return; }
      show("✅ تم تسجيل اللاعب");
    }
    await loadData();
    setFormModal(false);
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>📋 تسجيل اللاعبين</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{players.length} لاعب مسجل</div>
        </div>
        {canEdit && (
          <button onClick={openAdd} style={{ padding: "9px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ إضافة لاعب</button>
        )}
      </div>

      <input placeholder="بحث بالاسم أو رقم الهوية أو رقم العضوية..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "10px 14px", fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr", gap: 12 }}>
        {players.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: "15px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={p.name[0]} size={44} color={COLORS.accent} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{p.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>🪪 {p.id} {p.category ? `· ${p.category}` : ""}</div>
                {p.membership_number && <div style={{ fontSize: 10, color: COLORS.accentGold, marginTop: 2 }}>عضوية رقم {p.membership_number}</div>}
              </div>
              <Badge text={p.status || "نشط"} color={p.status === "موقوف" ? COLORS.danger : COLORS.accent} />
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 0", color: COLORS.textSecondary }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
            <div>لا يوجد لاعبون مسجلون بعد</div>
          </div>
        )}
      </div>

      {/* تفاصيل اللاعب */}
      {selected && (
        <Modal title={`👤 ${selected.name}`} onClose={() => setSelected(null)} wide={isDesktop}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "الاسم الرباعي", value: selected.name, icon: "👤" },
              { label: "تاريخ الميلاد", value: selected.birth_date, icon: "🎂" },
              { label: "رقم الهوية", value: selected.id, icon: "🪪" },
              { label: "رقم الجوال", value: selected.phone, icon: "📱" },
              { label: "اسم ولي الأمر", value: selected.parent_name, icon: "👨‍👦" },
              { label: "رقم جوال ولي الأمر", value: selected.parent_phone, icon: "📞" },
              { label: "إصابات سابقة", value: selected.medical?.injuries, icon: "🩹" },
              { label: "بداية الاشتراك", value: selected.subscription_start, icon: "📅" },
              { label: "نهاية الاشتراك", value: selected.subscription_end, icon: "📅" },
              { label: "المركز", value: selected.position, icon: "⚽" },
              { label: "رقم العضوية", value: selected.membership_number, icon: "🏷️" },
              { label: "الفئة", value: selected.category, icon: "🏆" },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.icon} {item.label}</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{item.value || "-"}</span>
              </div>
            ))}
          </div>
          {canEdit && (
            <button onClick={() => { openEdit(selected); setSelected(null); }} style={{ width: "100%", padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>✏️ تعديل بيانات اللاعب</button>
          )}
        </Modal>
      )}

      {/* نموذج إضافة/تعديل */}
      {formModal && (
        <Modal title={editId ? "✏️ تعديل بيانات لاعب" : "➕ تسجيل لاعب جديد"} onClose={() => setFormModal(false)} wide={isDesktop}>
          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="الاسم الرباعي *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <Field label="رقم الهوية *" value={form.id} onChange={v => setForm(p => ({ ...p, id: v }))} />
            {!editId && <Field label="كلمة السر *" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} />}
            <Field label="تاريخ الميلاد" value={form.birthDate} onChange={v => setForm(p => ({ ...p, birthDate: v }))} placeholder="١٤٤٠/٥/١٠" />
            <Field label="رقم الجوال" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
            <Field label="اسم ولي الأمر" value={form.parentName} onChange={v => setForm(p => ({ ...p, parentName: v }))} />
            <Field label="رقم جوال ولي الأمر" value={form.parentPhone} onChange={v => setForm(p => ({ ...p, parentPhone: v }))} />
            <Field label="هل يوجد إصابات سابقة" value={form.previousInjuries} onChange={v => setForm(p => ({ ...p, previousInjuries: v }))} placeholder="لا يوجد" />
            <Field label="بداية الاشتراك" value={form.subscriptionStart} onChange={v => setForm(p => ({ ...p, subscriptionStart: v }))} placeholder="١٤٤٧/١/١" />
            <Field label="نهاية الاشتراك" value={form.subscriptionEnd} onChange={v => setForm(p => ({ ...p, subscriptionEnd: v }))} placeholder="١٤٤٧/٤/١" />
            <Field label="المركز" value={form.position} onChange={v => setForm(p => ({ ...p, position: v }))} options={["مهاجم", "وسط", "دفاع", "حارس", "-"]} />
            <Field label="رقم العضوية" value={form.membershipNumber} onChange={v => setForm(p => ({ ...p, membershipNumber: v }))} />
            <Field label="الفئة" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} options={PLAYER_CATEGORIES} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setFormModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={savePlayer} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>{editId ? "✅ حفظ التعديلات" : "✅ تسجيل اللاعب"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
