import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Badge, StatCard, MiniBar, ToastMsg } from "../components/ui";

export function ProfilePage({ user, users, setUsers }) {
  const [tab, setTab] = useState("info");
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const child = user.role === "ولي أمر" ? users.find(u => u.id === user.childId) : null;
  const profileUser = child || user;
  const isAdmin = user.role === "مدير";
  const canEditData = isAdmin || user.permissions?.editData;
  const canEditMedical = isAdmin || user.permissions?.editMedical;
  const canEditRatings = isAdmin || user.permissions?.editRatings;

  const [editInfo, setEditInfo] = useState({ ...profileUser });
  const [editMedical, setEditMedical] = useState({ ...(profileUser.medical || {}) });
  const [editRatings, setEditRatings] = useState({ ...(profileUser.ratings || {}) });
  const [editMode, setEditMode] = useState(false);

  const saveInfo = async () => {
    await supabase.from('users').update({
      name: editInfo.name,
      phone: editInfo.phone,
      position: editInfo.position,
      custom_role: editInfo.customRole,
    }).eq('id', profileUser.id);
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, ...editInfo } : u));
    setEditMode(false);
    show("✅ تم حفظ البيانات");
  };

  const saveMedical = async () => {
    await supabase.from('medical_records').upsert({ user_id: profileUser.id, ...editMedical });
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, medical: editMedical } : u));
    show("✅ تم حفظ السجل الطبي");
  };

  const saveRatings = async () => {
    await supabase.from('users').update({ ratings: editRatings }).eq('id', profileUser.id);
    setUsers(prev => prev.map(u => u.id === profileUser.id ? { ...u, ratings: editRatings } : u));
    show("✅ تم حفظ التقييمات");
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      {user.role === "ولي أمر" && child && (
        <div style={{ background: COLORS.accentBlue + "15", border: `1px solid ${COLORS.accentBlue}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: COLORS.accentBlue }}>
          👨‍👦 تعرض ملف ابنك: <strong>{child.name}</strong>
        </div>
      )}

      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* بطاقة البروفايل */}
        <div>
          <div style={{ background: "linear-gradient(135deg,#0f1628,#1a2540)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "24px", marginBottom: 14, textAlign: "center", position: "relative" }}>
            <div style={{ width: 82, height: 82, borderRadius: "50%", background: "linear-gradient(135deg,#00c896,#0066cc)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#fff", boxShadow: "0 0 30px #00c89655" }}>{profileUser.name[0]}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>{profileUser.name}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, margin: "4px 0 8px" }}>
              {profileUser.customRole || profileUser.role}
              {profileUser.position !== "-" ? ` · ${profileUser.position}` : ""}
            </div>
            {profileUser.membership !== "-" && <Badge text={`عضوية ${profileUser.membership}`} color={COLORS.accentGold} />}
            <div style={{ marginTop: 8 }}><Badge text={profileUser.status || "نشط"} color={profileUser.status === "موقوف" ? COLORS.danger : COLORS.accent} /></div>

            {canEditData && (
              <button onClick={() => editMode ? saveInfo() : setEditMode(true)}
                style={{ marginTop: 14, width: "100%", padding: "9px", background: editMode ? COLORS.accent : COLORS.surface, border: `1px solid ${COLORS.border}`, color: editMode ? "#000" : COLORS.textSecondary, borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                {editMode ? "💾 حفظ التعديلات" : "✏️ تعديل البيانات"}
              </button>
            )}
          </div>

          {/* إحصائيات */}
          {profileUser.role === "لاعب" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard label="الحضور" value={`${profileUser.attendance}٪`} icon="✅" color={COLORS.accent} />
              <StatCard label="النقاط" value={String(profileUser.points)} icon="⭐" color={COLORS.accentGold} />
            </div>
          )}
        </div>

        {/* التبويبات */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { id: "info",        label: "📋 البيانات" },
              { id: "medical",     label: "🏥 الطبي" },
              { id: "performance", label: "📊 الأداء" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px", borderRadius: 12, background: tab === t.id ? COLORS.accent : COLORS.cardBg, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`, color: tab === t.id ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
            ))}
          </div>

          {/* البيانات الشخصية */}
          {tab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
              {[
                { label: "الاسم", key: "name", icon: "👤" },
                { label: "رقم الهوية", key: "id", icon: "🪪" },
                { label: "رقم الجوال", key: "phone", icon: "📱" },
                { label: "المركز", key: "position", icon: "⚽" },
                { label: "المسمى الوظيفي", key: "customRole", icon: "🏷️" },
              ].map((item, i) => (
                <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                    {editMode && canEditData ? (
                      <input value={editInfo[item.key] || ""} onChange={e => setEditInfo(p => ({ ...p, [item.key]: e.target.value }))}
                        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 8, padding: "4px 8px", fontSize: 13, width: "100%", marginTop: 2, boxSizing: "border-box" }} />
                    ) : (
                      <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginTop: 2 }}>{profileUser[item.key] || "-"}</div>
                    )}
                  </div>
                </div>
              ))}
              {!canEditData && (
                <div style={{ gridColumn: "1/-1", background: COLORS.warning + "15", border: `1px solid ${COLORS.warning}33`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.warning }}>
                  ⚠️ لا تملك صلاحية تعديل البيانات الشخصية
                </div>
              )}
            </div>
          )}

          {/* السجل الطبي */}
          {tab === "medical" && (
            <div>
              {(isAdmin || canEditMedical || user.role === "ولي أمر" || user.id === profileUser.id) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "الحالة الصحية", key: "health", icon: "💚" },
                    { label: "الإصابات السابقة", key: "injuries", icon: "🩹" },
                    { label: "الحساسية", key: "allergies", icon: "🌿" },
                    { label: "الأدوية", key: "medications", icon: "💊" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 16px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                        {canEditMedical ? (
                          <input value={editMedical[item.key] || ""} onChange={e => setEditMedical(p => ({ ...p, [item.key]: e.target.value }))}
                            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 8, padding: "4px 8px", fontSize: 13, width: "100%", marginTop: 2, boxSizing: "border-box" }} />
                        ) : (
                          <div style={{ fontSize: 14, color: COLORS.textPrimary, marginTop: 2 }}>{profileUser.medical?.[item.key] || "لا يوجد"}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {canEditMedical && (
                    <button onClick={saveMedical} style={{ padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>💾 حفظ السجل الطبي</button>
                  )}
                </div>
              ) : (
                <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "40px", textAlign: "center", color: COLORS.textSecondary }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                  <div>السجل الطبي محمي — يظهر للمدير وأصحاب الصلاحية فقط</div>
                </div>
              )}
            </div>
          )}

          {/* تقييم الأداء */}
          {tab === "performance" && (
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 18 }}>📊 تقييم الموسم</div>
              {profileUser.role === "لاعب" ? (
                <>
                  {[
                    { label: "السرعة",        key: "speed",    color: COLORS.accent },
                    { label: "التمرير",       key: "passing",  color: COLORS.accentBlue },
                    { label: "التسديد",       key: "shooting", color: COLORS.warning },
                    { label: "الدفاع",        key: "defense",  color: COLORS.purple },
                    { label: "الروح الرياضية",key: "spirit",   color: COLORS.accentGold },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: COLORS.textSecondary }}>{s.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {canEditRatings && (
                            <input type="number" min="0" max="100" value={editRatings[s.key] || 0}
                              onChange={e => setEditRatings(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                              style={{ width: 52, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: s.color, borderRadius: 6, padding: "2px 6px", fontSize: 13, fontWeight: 700, textAlign: "center" }} />
                          )}
                          <span style={{ color: s.color, fontWeight: 700, minWidth: 36 }}>{profileUser.ratings?.[s.key] || 0}٪</span>
                        </div>
                      </div>
                      <MiniBar percent={profileUser.ratings?.[s.key] || 0} color={s.color} />
                    </div>
                  ))}
                  {canEditRatings && (
                    <button onClick={saveRatings} style={{ width: "100%", marginTop: 8, padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>💾 حفظ التقييمات</button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: COLORS.textSecondary }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                  <div>التقييمات متاحة للاعبين فقط</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
