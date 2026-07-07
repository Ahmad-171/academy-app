import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { createAccount } from "../lib/auth";
import { COLORS } from "../constants/colors";
import { PERMISSION_LABELS, isManager } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { StatCard, Avatar, Badge, MiniBar, Modal, Field, ToastMsg } from "../components/ui";
import { FinanceManager } from "./FinanceManager";
import { AttendanceManager } from "./AttendanceManager";
import { EvaluationManager } from "./EvaluationManager";
import { NotesManager } from "./NotesManager";

const EMPTY_PRODUCT = { name: "", price: "", category: "ملابس", img: "👕" };
const EMPTY_CODE = { code: "", percent: "", maxUses: "" };

export function AdminPage({ user, users, setUsers, products, setProducts, loadData, subscriptionPlans, saveSubscriptionPlans }) {
  const isAdmin = isManager(user);
  const can = (perm) => isAdmin || !!user.permissions?.[perm];
  // حساب المبرمج فقط يرى الحسابات المخفية ويتحكم في إخفائها/إظهارها
  const canSeeHidden = user.role === "مبرمج";

  const TABS = [
    { id: "overview",    label: "📊 لوحة التحكم",        show: isAdmin },
    { id: "accounts",    label: "👥 الحسابات",           show: isAdmin },
    { id: "permissions", label: "🔑 الصلاحيات",          show: isAdmin },
    { id: "attendance",  label: "🕒 الحضور والانصراف",   show: can("editSchedule") },
    { id: "evaluation",  label: "⭐ التقييم",             show: can("editRatings") },
    { id: "notes",       label: "📝 الملاحظات",          show: can("editData") },
    { id: "finance",     label: "💰 المالية",            show: isAdmin },
    { id: "reports",     label: "📈 التقارير",           show: isAdmin },
    { id: "pricing",     label: "💲 الأسعار",            show: can("editCommerce") },
  ].filter(t => t.show);

  const [adminTab, setAdminTab] = useState(TABS[0]?.id || "overview");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("الكل");
  const [permTarget, setPermTarget] = useState(null);
  const [productModal, setProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState(EMPTY_CODE);
  const productPriceEdits = useRef({});
  const planPriceEdits = useRef({});
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  // ── أكواد الخصم ──
  const loadCodes = useCallback(async () => {
    const { data } = await supabase.from('discount_codes').select('*').order('code');
    setCodes(data || []);
  }, []);

  useEffect(() => { if (adminTab === "pricing") loadCodes(); }, [adminTab, loadCodes]);

  const createCode = async () => {
    const code = newCode.code.trim().toUpperCase();
    const percent = Number(newCode.percent);
    if (!code || !percent || percent <= 0 || percent > 100) {
      show("⚠️ أدخل كودًا ونسبة خصم صحيحة (١-١٠٠)", COLORS.warning); return;
    }
    const { error } = await supabase.from('discount_codes').upsert({
      code, percent_off: percent, active: true,
      max_uses: newCode.maxUses ? Number(newCode.maxUses) : null,
      used_count: 0,
    });
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setNewCode(EMPTY_CODE);
    show(`✅ تم إنشاء الكود ${code}`);
    loadCodes();
  };

  const toggleCode = async (c) => {
    await supabase.from('discount_codes').update({ active: !c.active }).eq('code', c.code);
    loadCodes();
  };

  const deleteCode = async (c) => {
    await supabase.from('discount_codes').delete().eq('code', c.code);
    show("🗑️ تم حذف الكود", COLORS.danger);
    loadCodes();
  };

  // ── المنتجات ──
  const saveProductPrice = async (p) => {
    const price = productPriceEdits.current[p.id] ?? p.price;
    const { error } = await supabase.from('products').update({ price: Number(price) }).eq('id', p.id);
    if (error) { show(`⚠️ خطأ: ${error.message}`, COLORS.danger); return; }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, price: Number(price) } : x));
    show(`✅ تم تحديث سعر ${p.name}`);
  };

  const addProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) { show("⚠️ أدخل اسم المنتج والسعر", COLORS.warning); return; }
    const { data, error } = await supabase.from('products').insert({
      name: newProduct.name, price: Number(newProduct.price),
      category: newProduct.category, img: newProduct.img || "🛍️", images: [],
    }).select().single();
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setProducts(prev => [...prev, { ...data, images: data.images || [] }]);
    setNewProduct(EMPTY_PRODUCT);
    setProductModal(false);
    show("✅ تم إضافة المنتج");
  };

  const deleteProduct = async (p) => {
    await supabase.from('products').delete().eq('id', p.id);
    setProducts(prev => prev.filter(x => x.id !== p.id));
    show("🗑️ تم حذف المنتج", COLORS.danger);
  };

  // ── أسعار الاشتراكات ──
  const savePlanPrice = (idx) => {
    const price = Number(planPriceEdits.current[idx] ?? subscriptionPlans[idx].price);
    const updated = subscriptionPlans.map((p, i) => i === idx ? { ...p, price } : p);
    saveSubscriptionPlans(updated);
    show(`✅ تم تحديث سعر ${subscriptionPlans[idx].label}`);
  };

  const EMPTY_FORM = {
    name: "", id: "", password: "", role: "لاعب", customRole: "لاعب",
    position: "-", phone: "", membership: "فضي", status: "نشط",
    childId: "", coachId: "", hidden: false,
    permissions: { editSchedule: false, editData: false, sendNotifications: false, editRatings: false, editMedical: false, editLibrary: false, editCommerce: false },
  };

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setModal("form"); };
  const openEdit = (u) => { setForm({ ...EMPTY_FORM, ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions || {}) } }); setEditId(u.id); setModal("form"); };

  const saveAccount = async () => {
    if (!form.name?.trim() || !form.id?.trim()) {
      show("⚠️ الاسم ورقم الهوية مطلوبان", COLORS.warning); return;
    }
    if (!/^\d{10,}$/.test(form.id.trim())) {
      show("⚠️ رقم الهوية يجب أن يكون أرقامًا (10 خانات على الأقل)", COLORS.warning); return;
    }
    if (form.phone && !/^0?5\d{8}$/.test(form.phone.replace(/\s/g, ""))) {
      show("⚠️ رقم الجوال غير صحيح (مثال: 05xxxxxxxx)", COLORS.warning); return;
    }

    // الحقول المشتركة القابلة للتعديل
    const profile = {
      role: form.role,
      custom_role: form.customRole || form.role,
      name: form.name,
      phone: form.phone,
      membership: form.membership || '-',
      status: form.status || 'نشط',
      position: form.position || '-',
      child_id: form.childId || null,
      coach_id: form.coachId || null,
      permissions: form.permissions || {},
      hidden: !!form.hidden,
    };

    if (editId) {
      const { error } = await supabase.from('users')
        .update({ ...profile, points: form.points, attendance: form.attendance })
        .eq('id', editId);
      if (error) { show(`⚠️ خطأ: ${error.message}`, COLORS.danger); return; }
      show("✅ تم تحديث الحساب");
    } else {
      if (!form.password?.trim() || form.password.trim().length < 6) {
        show("⚠️ كلمة السر مطلوبة (6 خانات على الأقل)", COLORS.warning); return;
      }
      if (users.find(u => u.id === form.id)) {
        show("⚠️ رقم الهوية مستخدم مسبقاً", COLORS.warning); return;
      }
      const { error } = await createAccount({
        id: form.id.trim(),
        password: form.password.trim(),
        profile: {
          ...profile,
          points: 0,
          attendance: 0,
          medical: { health: "جيدة", injuries: "لا يوجد", allergies: "لا يوجد", medications: "لا يوجد" },
          ratings: { speed: 70, passing: 70, shooting: 70, defense: 70, spirit: 70 },
        },
      });
      if (error) { show(`⚠️ خطأ: ${error}`, COLORS.danger); return; }
      show("✅ تم إضافة الحساب");
    }
    await loadData();
    setModal(null);
  };

  const toggleSuspend = async (u) => {
    const newStatus = u.status === "موقوف" ? "نشط" : "موقوف";
    await supabase.from('users').update({ status: newStatus }).eq('id', u.id);
    setUsers(prev => prev.map(a => a.id === u.id ? { ...a, status: newStatus } : a));
    show(u.status === "موقوف" ? "✅ تم تفعيل الحساب" : "⛔ تم إيقاف الحساب", u.status === "موقوف" ? COLORS.accent : COLORS.danger);
    setModal(null);
  };

  const deleteAccount = async (id) => {
    await supabase.from('users').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
    show("🗑️ تم حذف الحساب", COLORS.danger);
    setModal(null);
  };

  // إخفاء/إظهار حساب: المخفي لا يظهر في باقي أنحاء الموقع (يبقى في قائمة الإدارة)
  const toggleHidden = async (u) => {
    const next = !u.hidden;
    const { error } = await supabase.from('users').update({ hidden: next }).eq('id', u.id);
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); return; }
    setUsers(prev => prev.map(a => a.id === u.id ? { ...a, hidden: next } : a));
    show(next ? "🙈 تم إخفاء الحساب" : "👁️ تم إظهار الحساب", next ? COLORS.purple : COLORS.accent);
  };

  const savePermissions = async () => {
    await supabase.from('users').update({ permissions: permTarget.permissions }).eq('id', permTarget.id);
    setUsers(prev => prev.map(u => u.id === permTarget.id ? { ...u, permissions: permTarget.permissions } : u));
    show("✅ تم حفظ الصلاحيات");
    setPermTarget(null);
  };

  // المبرمج يرى الكل بما فيها المخفية؛ غيره لا يرى المخفية إطلاقًا
  const visibleUsers = canSeeHidden ? users : users.filter(u => !u.hidden);
  const filtered = visibleUsers.filter(u => {
    const matchRole   = filterRole === "الكل" || u.role === filterRole;
    const matchSearch = u.name.includes(search) || u.id.includes(search) || u.phone?.includes(search);
    return matchRole && matchSearch;
  });

  const players  = visibleUsers.filter(u => u.role === "لاعب");
  const coaches  = visibleUsers.filter(u => u.role === "مدرب");
  const avgAtt   = players.length ? Math.round(players.reduce((s, p) => s + (p.attendance || 0), 0) / players.length) : 0;
  const statusColor = s => s === "موقوف" ? COLORS.danger : s === "معلق" ? COLORS.warning : COLORS.accent;
  const roleColor   = r => (r === "مدير" || r === "مبرمج") ? COLORS.purple : r === "مدرب" ? COLORS.accentGold : r === "ولي أمر" ? COLORS.accentBlue : COLORS.accent;

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ background: "linear-gradient(135deg,#1a0020,#2d003a)", border: "1px solid #a855f744", borderRadius: 16, padding: "15px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 26 }}>🔐</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.purple }}>لوحة تحكم المدير</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>صلاحيات كاملة · {users.length} حساب مسجل</div>
        </div>
      </div>

      {/* تبويبات — تظهر حسب الصلاحيات */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setAdminTab(t.id)} style={{ padding: "9px 16px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: adminTab === t.id ? COLORS.purple : COLORS.cardBg, border: `1px solid ${adminTab === t.id ? COLORS.purple : COLORS.border}`, color: adminTab === t.id ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {/* نظرة عامة */}
      {adminTab === "overview" && (
        <div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12 }}>
              <StatCard label="إجمالي المشتركين" value={String(players.length)} icon="👥" color={COLORS.accent} sub="لاعب مسجل" />
              <StatCard label="مشترك نشط" value={String(players.filter(p => p.status !== "موقوف").length)} icon="✅" color={COLORS.accentGold} sub="حساب فعّال" />
              <StatCard label="مشترك غير نشط" value={String(players.filter(p => p.status === "موقوف").length)} icon="⛔" color={COLORS.danger} sub="حساب موقوف" />
              <StatCard label="متوسط الحضور" value={`${avgAtt}٪`} icon="📊" color={COLORS.purple} sub="هذا الموسم" />
            </div>
          </div>

          <div style={{ display: "block", gap: 20 }}>
            {/* توزيع */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>توزيع الحسابات</div>
              {[
                { role: "لاعب",     color: COLORS.accent },
                { role: "مدرب",     color: COLORS.accentGold },
                { role: "ولي أمر",  color: COLORS.accentBlue },
                { role: "مدير",     color: COLORS.purple },
              ].map((r, i) => {
                const count = visibleUsers.filter(u => u.role === r.role).length;
                const pct   = visibleUsers.length ? Math.round((count/visibleUsers.length)*100) : 0;
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: COLORS.textSecondary }}>{r.role}</span>
                      <span style={{ color: r.color, fontWeight: 700 }}>{count} ({pct}٪)</span>
                    </div>
                    <MiniBar percent={pct} color={r.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* الحسابات */}
      {adminTab === "accounts" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={openAdd} style={{ padding: "10px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>+ إضافة</button>
            <input placeholder="بحث بالاسم أو الهوية أو الجوال..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 11, padding: "10px 14px", fontSize: 13 }} />
          </div>

          <div style={{ display: "flex", gap: 7, marginBottom: 14, overflowX: "auto" }}>
            {["الكل", "لاعب", "مدرب", "ولي أمر", "مدير"].map(r => (
              <button key={r} onClick={() => setFilterRole(r)} style={{ padding: "6px 14px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: filterRole === r ? COLORS.purple : COLORS.cardBg, border: `1px solid ${filterRole === r ? COLORS.purple : COLORS.border}`, color: filterRole === r ? "#fff" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{r}</button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 }}>{filtered.length} حساب</div>

          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map(u => (
              <div key={u.id} style={{ background: COLORS.cardBg, border: `1px solid ${u.hidden ? COLORS.purple+"66" : u.status === "موقوف" ? COLORS.danger+"44" : COLORS.border}`, borderRadius: 15, padding: "15px", marginBottom: isDesktop ? 0 : 10, opacity: u.status === "موقوف" || u.hidden ? 0.7 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar letter={u.name[0]} size={44} color={roleColor(u.role)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{u.name}</span>
                      <Badge text={u.status || "نشط"} color={statusColor(u.status || "نشط")} />
                      {u.hidden && <Badge text="🙈 مخفي" color={COLORS.purple} />}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.customRole || u.role}{u.position !== "-" ? ` · ${u.position}` : ""}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>🪪 {u.id} · 📱 {u.phone}</div>
                    {u.membership !== "-" && <div style={{ fontSize: 10, color: COLORS.accentGold, marginTop: 2 }}>عضوية {u.membership}</div>}
                    {u.role === "لاعب" && <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>نقاط: {u.points} · حضور: {u.attendance}٪</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(u)} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: COLORS.accentBlue+"22", border: `1px solid ${COLORS.accentBlue}44`, color: COLORS.accentBlue, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ تعديل</button>
                  <button onClick={() => { setPermTarget({ ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions||{}) } }); }} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: COLORS.purple+"22", border: `1px solid ${COLORS.purple}44`, color: COLORS.purple, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🔑 صلاحيات</button>
                  <button onClick={() => { setActionTarget(u); setModal("suspend"); }} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: u.status==="موقوف" ? COLORS.accent+"22" : COLORS.warning+"22", border: `1px solid ${u.status==="موقوف" ? COLORS.accent+"44" : COLORS.warning+"44"}`, color: u.status==="موقوف" ? COLORS.accent : COLORS.warning, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{u.status==="موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
                  {canSeeHidden && (
                    <button onClick={() => toggleHidden(u)} style={{ flex: 1, minWidth: 60, padding: "7px", borderRadius: 9, background: u.hidden ? COLORS.purple+"33" : COLORS.surface, border: `1px solid ${u.hidden ? COLORS.purple+"66" : COLORS.border}`, color: u.hidden ? COLORS.purple : COLORS.textSecondary, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{u.hidden ? "👁️ إظهار" : "🙈 إخفاء"}</button>
                  )}
                  <button onClick={() => { setActionTarget(u); setModal("delete"); }} style={{ padding: "7px 10px", borderRadius: 9, background: COLORS.danger+"22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الصلاحيات */}
      {adminTab === "permissions" && (
        <div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>اختر حساباً لتعديل صلاحياته المخصصة</div>
          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {visibleUsers.filter(u => u.role !== "مدير" && u.role !== "مبرمج").map(u => (
              <div key={u.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: isDesktop ? 0 : 10, cursor: "pointer" }}
                onClick={() => setPermTarget({ ...u, permissions: { ...EMPTY_FORM.permissions, ...(u.permissions||{}) } })}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar letter={u.name[0]} size={38} color={roleColor(u.role)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.customRole || u.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Object.entries(u.permissions || {}).filter(([,v]) => v).map(([k]) => (
                    <Badge key={k} text={PERMISSION_LABELS[k] || k} color={COLORS.accent} />
                  ))}
                  {!Object.values(u.permissions || {}).some(Boolean) && (
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>لا توجد صلاحيات مخصصة</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المالية */}
      {adminTab === "finance" && (
  <FinanceManager user={user} />
)}
      {/* الحضور والانصراف */}
      {adminTab === "attendance" && (
        <AttendanceManager users={users} />
      )}
      {/* التقييم */}
      {adminTab === "evaluation" && (
        <EvaluationManager users={users} />
      )}
      {/* الملاحظات */}
      {adminTab === "notes" && (
        <NotesManager users={users} />
      )}
{/* الأسعار */}
{adminTab === "pricing" && (
  <div>
    {/* أسعار الاشتراكات */}
    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>
      💳 أسعار الاشتراكات
    </div>
    <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
      {subscriptionPlans.map((p, i) => (
        <div key={p.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: isDesktop ? 0 : 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 10 }}>{p.label}</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 5 }}>السعر (ر.س)</div>
          <input
            type="number"
            defaultValue={p.price}
            onChange={e => { planPriceEdits.current[i] = e.target.value; }}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.accent, borderRadius: 10, padding: "10px 12px", fontSize: 18, fontWeight: 900, boxSizing: "border-box", marginBottom: 10 }}
          />
          <button onClick={() => savePlanPrice(i)} style={{ width: "100%", padding: "9px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>💾 حفظ</button>
        </div>
      ))}
    </div>

    {/* المنتجات */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>🛒 منتجات المتجر</div>
      <button onClick={() => { setNewProduct(EMPTY_PRODUCT); setProductModal(true); }} style={{ padding: "8px 16px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ منتج جديد</button>
    </div>
    {isDesktop && (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
        <thead>
          <tr style={{ background: COLORS.surface }}>
            {["المنتج", "التصنيف", "السعر (ر.س)", "إجراء"].map((h, i) => (
              <th key={i} style={{ padding: "12px 14px", fontSize: 12, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{p.img}</span>
                  <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{p.name}</span>
                </div>
              </td>
              <td style={{ padding: "12px 14px", textAlign: "center" }}>
                <Badge text={p.category} color={COLORS.textSecondary} />
              </td>
              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                <input
                  type="number"
                  defaultValue={p.price}
                  onChange={e => { productPriceEdits.current[p.id] = e.target.value; }}
                  style={{ width: 90, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.accentGold, borderRadius: 8, padding: "6px 10px", fontSize: 14, fontWeight: 800, textAlign: "center" }}
                />
              </td>
              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <button onClick={() => saveProductPrice(p)} style={{ padding: "7px 14px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>💾</button>
                  <button onClick={() => deleteProduct(p)} style={{ padding: "7px 14px", background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={4} style={{ padding: "26px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد منتجات — أضف أول منتج</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
    )}

    {!isDesktop && (
      <div style={{ marginBottom: 28 }}>
        {products.length === 0 ? (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد منتجات — أضف أول منتج</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "13px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{p.img}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{p.name}</div>
                    <Badge text={p.category} color={COLORS.textSecondary} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 }}>السعر (ر.س)</div>
                    <input
                      type="number"
                      defaultValue={p.price}
                      onChange={e => { productPriceEdits.current[p.id] = e.target.value; }}
                      style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.accentGold, borderRadius: 8, padding: "9px 10px", fontSize: 15, fontWeight: 800, textAlign: "center", boxSizing: "border-box" }}
                    />
                  </div>
                  <button onClick={() => saveProductPrice(p)} style={{ padding: "10px 16px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>💾 حفظ</button>
                  <button onClick={() => deleteProduct(p)} style={{ padding: "10px 14px", background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* أكواد الخصم */}
    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 14 }}>🎟️ أكواد الخصم</div>
    <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "320px 1fr", gap: 16 }}>
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: isDesktop ? 0 : 12, alignSelf: "start" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 12 }}>➕ إنشاء كود جديد</div>
        <Field label="الكود" value={newCode.code} onChange={v => setNewCode(p => ({ ...p, code: v }))} placeholder="مثال: SUMMER20" />
        <Field label="نسبة الخصم ٪" value={newCode.percent} onChange={v => setNewCode(p => ({ ...p, percent: v }))} type="number" placeholder="20" />
        <Field label="عدد الاستخدامات (اتركه فارغًا = بلا حد)" value={newCode.maxUses} onChange={v => setNewCode(p => ({ ...p, maxUses: v }))} type="number" placeholder="مثال: 50" />
        <button onClick={createCode} style={{ width: "100%", padding: "11px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>✅ إنشاء الكود</button>
      </div>
      {isDesktop && (
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
          <thead>
            <tr style={{ background: COLORS.surface }}>
              {["الكود", "الخصم", "الاستخدام", "الحالة", "إجراء"].map((h, i) => (
                <th key={i} style={{ padding: "10px", fontSize: 11, color: COLORS.textSecondary, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map(c => {
              const exhausted = c.max_uses != null && (c.used_count || 0) >= c.max_uses;
              return (
                <tr key={c.code} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: 13, fontWeight: 800, color: COLORS.textPrimary }}>{c.code}</td>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{c.percent_off}٪</td>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.textSecondary }}>{c.used_count || 0}{c.max_uses != null ? ` / ${c.max_uses}` : " (بلا حد)"}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <Badge text={exhausted ? "منتهي" : c.active ? "مفعّل" : "موقوف"} color={exhausted ? COLORS.textSecondary : c.active ? COLORS.accent : COLORS.danger} />
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => toggleCode(c)} style={{ padding: "5px 10px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{c.active ? "إيقاف" : "تفعيل"}</button>
                      <button onClick={() => deleteCode(c)} style={{ padding: "5px 10px", background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 7, fontSize: 11, cursor: "pointer" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "26px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد أكواد بعد</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {!isDesktop && (
        codes.length === 0 ? (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 22, textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>لا توجد أكواد بعد</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {codes.map(c => {
              const exhausted = c.max_uses != null && (c.used_count || 0) >= c.max_uses;
              return (
                <div key={c.code} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "13px 15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: COLORS.textPrimary, letterSpacing: 0.5 }}>{c.code}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: COLORS.accent }}>{c.percent_off}٪</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>الاستخدام: {c.used_count || 0}{c.max_uses != null ? ` / ${c.max_uses}` : " (بلا حد)"}</span>
                    <Badge text={exhausted ? "منتهي" : c.active ? "مفعّل" : "موقوف"} color={exhausted ? COLORS.textSecondary : c.active ? COLORS.accent : COLORS.danger} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleCode(c)} style={{ flex: 1, padding: "9px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{c.active ? "إيقاف" : "تفعيل"}</button>
                    <button onClick={() => deleteCode(c)} style={{ padding: "9px 16px", background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️ حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>

    {/* Modal منتج جديد */}
    {productModal && (
      <Modal title="➕ منتج جديد" onClose={() => setProductModal(false)}>
        <Field label="اسم المنتج *" value={newProduct.name} onChange={v => setNewProduct(p => ({ ...p, name: v }))} placeholder="مثال: طقم الأكاديمية" />
        <Field label="السعر (ر.س) *" value={newProduct.price} onChange={v => setNewProduct(p => ({ ...p, price: v }))} type="number" />
        <Field label="التصنيف" value={newProduct.category} onChange={v => setNewProduct(p => ({ ...p, category: v }))} options={["ملابس", "إكسسوار", "حقائب", "معدات"]} />
        <Field label="الرمز التعبيري" value={newProduct.img} onChange={v => setNewProduct(p => ({ ...p, img: v }))} placeholder="👕" />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setProductModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
          <button onClick={addProduct} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ إضافة</button>
        </div>
      </Modal>
    )}
  </div>
)}
      {/* التقارير */}
      {adminTab === "reports" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(2,1fr)" : "1fr", gap: 14, marginBottom: 20 }}>
            {[
              { title: "متوسط حضور اللاعبين", value: `${avgAtt}٪`, icon: "✅", color: COLORS.accent },
              { title: "متوسط حضور المدربين", value: `${coaches.length ? Math.round(coaches.reduce((s,c)=>s+c.attendance,0)/coaches.length) : 0}٪`, icon: "👨‍🏫", color: COLORS.accentGold },
              { title: "نمو الاشتراكات", value: "+١٢٪", icon: "📈", color: COLORS.accentBlue },
              { title: "رضا أولياء الأمور", value: "٩١٪", icon: "👨‍👦", color: COLORS.purple },
            ].map((r, i) => (
              <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${r.color}22`, border: `1px solid ${r.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{r.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: r.color, marginTop: 2 }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 16 }}>أداء المدربين</div>
            {coaches.length === 0 ? (
              <div style={{ color: COLORS.textSecondary, fontSize: 13, textAlign: "center", padding: "20px" }}>لا يوجد مدربون</div>
            ) : coaches.map((c, i) => {
              const r = [4.9, 4.7, 4.5][i] || 4.3;
              return (
                <div key={c.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar letter={c.name[0]} size={30} color={COLORS.accentGold} />
                      <div>
                        <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>حضور {c.attendance}٪</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.accentGold, fontWeight: 800 }}>⭐ {r}</span>
                  </div>
                  <MiniBar percent={(r/5)*100} color={COLORS.accentGold} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal إضافة/تعديل حساب */}
      {modal === "form" && (
        <Modal title={editId ? "✏️ تعديل الحساب" : "➕ إضافة حساب جديد"} onClose={() => setModal(null)} wide={isDesktop}>
          <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="الاسم *" value={form.name || ""} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <Field label="رقم الهوية *" value={form.id || ""} onChange={v => setForm(p => ({ ...p, id: v }))} />
            <Field label="كلمة السر *" value={form.password || ""} onChange={v => setForm(p => ({ ...p, password: v }))} />
            <Field label="نوع الحساب" value={form.role || "لاعب"} onChange={v => setForm(p => ({ ...p, role: v, customRole: v }))}
              options={["لاعب", "مدرب", "ولي أمر", "مدير"]} />
            <Field label="المسمى المخصص" value={form.customRole || ""} onChange={v => setForm(p => ({ ...p, customRole: v }))} placeholder="مثال: مساعد مدرب" />
            <Field label="رقم الجوال" value={form.phone || ""} onChange={v => setForm(p => ({ ...p, phone: v }))} />
            {form.role === "لاعب" && <>
              <Field label="المركز" value={form.position || "-"} onChange={v => setForm(p => ({ ...p, position: v }))} options={["مهاجم", "وسط", "دفاع", "حارس", "-"]} />
              <Field label="العضوية" value={form.membership || "فضية"} onChange={v => setForm(p => ({ ...p, membership: v }))} options={["فضية", "ذهبية", "ماسية"]} />
              <Field label="المدرب المسؤول (ID)" value={form.coachId || ""} onChange={v => setForm(p => ({ ...p, coachId: v }))} placeholder="رقم هوية المدرب" />
            </>}
            {form.role === "ولي أمر" && (
              <Field label="رقم هوية اللاعب (الابن)" value={form.childId || ""} onChange={v => setForm(p => ({ ...p, childId: v }))} placeholder="رقم هوية اللاعب" />
            )}
            <Field label="الحالة" value={form.status || "نشط"} onChange={v => setForm(p => ({ ...p, status: v }))} options={["نشط", "موقوف", "معلق"]} />
          </div>

          {/* الصلاحيات */}
          {form.role !== "مدير" && (
            <div style={{ marginTop: 16, background: COLORS.surface, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>🔑 الصلاحيات المخصصة:</div>
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <div key={key} onClick={() => setForm(p => ({ ...p, permissions: { ...(p.permissions||{}), [key]: !(p.permissions||{})[key] } }))}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: form.permissions?.[key] ? COLORS.accent+"15" : COLORS.cardBg, border: `1px solid ${form.permissions?.[key] ? COLORS.accent+"55" : COLORS.border}`, borderRadius: 10, cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: form.permissions?.[key] ? COLORS.accent : COLORS.surface, border: `1px solid ${form.permissions?.[key] ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.permissions?.[key] && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: form.permissions?.[key] ? COLORS.accent : COLORS.textSecondary }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={saveAccount} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>{editId ? "✅ حفظ التعديلات" : "✅ إضافة الحساب"}</button>
          </div>
        </Modal>
      )}

      {/* Modal الصلاحيات المستقلة */}
      {permTarget && (
        <Modal title={`🔑 صلاحيات: ${permTarget.name}`} onClose={() => setPermTarget(null)}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>اختر الصلاحيات التي تريد منحها لهذا الحساب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <div key={key} onClick={() => setPermTarget(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: permTarget.permissions[key] ? COLORS.accent+"15" : COLORS.surface, border: `1px solid ${permTarget.permissions[key] ? COLORS.accent+"55" : COLORS.border}`, borderRadius: 12, cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: permTarget.permissions[key] ? COLORS.accent : COLORS.cardBg, border: `1px solid ${permTarget.permissions[key] ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {permTarget.permissions[key] && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: permTarget.permissions[key] ? COLORS.accent : COLORS.textSecondary, fontWeight: permTarget.permissions[key] ? 700 : 400 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setPermTarget(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={savePermissions} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>✅ حفظ الصلاحيات</button>
          </div>
        </Modal>
      )}

      {/* Modal تأكيد الإيقاف */}
      {modal === "suspend" && actionTarget && (
        <Modal title="تأكيد" onClose={() => setModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.8 }}>
            {actionTarget.status === "موقوف" ? `تفعيل حساب "${actionTarget.name}"؟` : `إيقاف حساب "${actionTarget.name}"؟ لن يتمكن من الدخول.`}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={() => toggleSuspend(actionTarget)} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: actionTarget.status === "موقوف" ? COLORS.accent : COLORS.warning, color: "#000", fontWeight: 800, cursor: "pointer" }}>{actionTarget.status === "موقوف" ? "✅ تفعيل" : "⛔ إيقاف"}</button>
          </div>
        </Modal>
      )}

      {/* Modal تأكيد الحذف */}
      {modal === "delete" && actionTarget && (
        <Modal title="⚠️ تأكيد الحذف" onClose={() => setModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.8 }}>
            حذف <strong style={{ color: COLORS.textPrimary }}>"{actionTarget.name}"</strong> نهائياً؟ لا يمكن التراجع.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={() => deleteAccount(actionTarget.id)} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.danger, color: "#fff", fontWeight: 800, cursor: "pointer" }}>🗑️ حذف نهائياً</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
