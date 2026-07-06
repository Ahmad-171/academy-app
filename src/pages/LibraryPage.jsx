import { useState } from "react";
import { supabase } from "../lib/supabase";
import { uploadMedia } from "../lib/media";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Badge, Modal, Field, ToastMsg } from "../components/ui";

export function LibraryPage({ user, library, setLibrary }) {
  const [category, setCategory] = useState("الكل");
  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", category: "تدريب", type: "image", emoji: "📸" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const canAdd = user.role === "مدير" || user.permissions?.editLibrary;
  const cats = ["الكل", "تدريب", "مباراة", "هدف", "إنجاز"];
  const filtered = category === "الكل" ? library : library.filter(i => i.category === category);

  const emojiMap = { تدريب: "🏃", مباراة: "🎬", هدف: "⚽", إنجاز: "🏆", image: "📸", video: "🎥", achievement: "🥇", goal: "⚽" };

  const addItem = async () => {
    if (!newItem.title.trim()) { show("⚠️ أدخل عنواناً", COLORS.warning); return; }
    setUploading(true);
    let mediaUrl = null;
    let type = newItem.type;
    if (file) {
      const { url, error } = await uploadMedia(file, "library");
      if (error) { show(`⚠️ فشل رفع الملف: ${error}`, COLORS.danger); setUploading(false); return; }
      mediaUrl = url;
      // نستنتج النوع تلقائيًا من الملف المرفوع
      if (file.type.startsWith("video")) type = "video";
      else if (file.type.startsWith("image")) type = "image";
    }
    const { data, error } = await supabase.from('library').insert({
      type,
      category: newItem.category,
      title: newItem.title,
      emoji: emojiMap[newItem.category] || "📸",
      date: new Date().toLocaleDateString("ar-SA"),
      added_by: user.name,
      media_url: mediaUrl,
    }).select().single();
    if (error) { show(`⚠️ ${error.message}`, COLORS.danger); setUploading(false); return; }
    if (data) setLibrary(prev => [{ ...data, addedBy: data.added_by }, ...prev]);
    setNewItem({ title: "", category: "تدريب", type: "image", emoji: "📸" });
    setFile(null);
    setUploading(false);
    setAddModal(false);
    show("✅ تم الإضافة للمعرض");
  };

  const deleteItem = async (id) => {
    await supabase.from('library').delete().eq('id', id);
    setLibrary(prev => prev.filter(i => i.id !== id));
    show("🗑️ تم الحذف", COLORS.danger);
  };

  const typeColors = { image: COLORS.accent, video: COLORS.accentBlue, achievement: COLORS.accentGold, goal: COLORS.warning };
  const typeLabels = { image: "📸 صورة", video: "🎥 فيديو", achievement: "🏆 إنجاز", goal: "⚽ هدف" };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>🖼️ معرض الصور</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{library.length} عنصر</div>
        </div>
        {canAdd && (
          <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ إضافة</button>
        )}
      </div>

      {/* فلتر التصنيفات */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      {/* الشبكة */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textSecondary }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 15 }}>لا توجد عناصر في هذا التصنيف</div>
          {canAdd && <button onClick={() => setAddModal(true)} style={{ marginTop: 16, padding: "10px 24px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>+ أضف أول عنصر</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 14 }}>
          {filtered.map((item, i) => (
            <div key={item.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", position: "relative" }}>
              {/* صورة/فيديو مصغّر */}
              <div style={{ height: isDesktop ? 140 : 110, background: item.media_url ? "#000" : `linear-gradient(135deg,${typeColors[item.type] || COLORS.accent}22,${typeColors[item.type] || COLORS.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDesktop ? 56 : 44, position: "relative", overflow: "hidden" }}>
                {item.media_url ? (
                  item.type === "video" ? (
                    <video src={item.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls />
                  ) : (
                    <img src={item.media_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )
                ) : item.emoji}
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <Badge text={typeLabels[item.type] || "📸 صورة"} color={typeColors[item.type] || COLORS.accent} />
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>{item.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Badge text={item.category} color={COLORS.textSecondary} />
                    <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 4 }}>{item.date}</div>
                  </div>
                  {canAdd && (
                    <button onClick={() => deleteItem(item.id)} style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, color: COLORS.danger, borderRadius: 7, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
                  )}
                </div>
                {item.addedBy && <div style={{ fontSize: 10, color: COLORS.accent, marginTop: 4 }}>أضافه: {item.addedBy}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة */}
      {addModal && (
        <Modal title="➕ إضافة للمكتبة" onClose={() => setAddModal(false)}>
          <Field label="العنوان" value={newItem.title} onChange={v => setNewItem(p => ({ ...p, title: v }))} placeholder="مثال: تدريب الأحد ١ يونيو" />
          <Field label="التصنيف" value={newItem.category} onChange={v => setNewItem(p => ({ ...p, category: v }))}
            options={["تدريب", "مباراة", "هدف", "إنجاز"]} />
          <Field label="النوع" value={newItem.type} onChange={v => setNewItem(p => ({ ...p, type: v }))}
            options={[{ value: "image", label: "📸 صورة" }, { value: "video", label: "🎥 فيديو" }, { value: "achievement", label: "🏆 إنجاز" }, { value: "goal", label: "⚽ هدف" }]} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>الصورة أو الفيديو (اختياري)</div>
            <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "10px 12px", fontSize: 13, boxSizing: "border-box" }} />
            {file && <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 6 }}>✓ {file.name}</div>}
          </div>
          {!file && (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 6 }}>{emojiMap[newItem.category] || "📸"}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>بدون ملف، يظهر العنصر برمز تعبيري فقط</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
            <button onClick={addItem} disabled={uploading} style={{ flex: 2, padding: "12px", borderRadius: 11, background: COLORS.accent, border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}>{uploading ? "جاري الرفع..." : "✅ إضافة"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
