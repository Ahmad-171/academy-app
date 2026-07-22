import { useState } from "react";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";

// عرض المتجر فقط: صورة المنتج واسمه وسعره. لا توجد سلة ولا شراء مباشر —
// الشراء يتم عبر إدارة الأكاديمية.
export function StorePage({ products = [], categories = ["ملابس", "إكسسوار", "حقائب", "معدات"] }) {
  const [category, setCategory] = useState("الكل");
  const { isDesktop } = useWindowSize();

  const filtered = category === "الكل" ? products : products.filter(p => p.category === category);

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>🛒 المتجر</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>الشراء يتم عبر إدارة الأكاديمية</div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {["الكل", ...categories].map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", color: COLORS.textSecondary, fontSize: 14 }}>
          لا توجد منتجات حاليًا
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12 }}>
          {filtered.map((p, i) => (
            <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: 14, textAlign: "center" }}>
              {p.images?.[0] ? (
                <div style={{ height: isDesktop ? 150 : 120, marginBottom: 10, background: COLORS.surface, borderRadius: 12, overflow: "hidden" }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ fontSize: isDesktop ? 56 : 46, marginBottom: 10, background: COLORS.surface, borderRadius: 12, padding: "16px" }}>{p.img}</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 8 }}>{p.category}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.accentGold }}>{p.price} <span style={{ fontSize: 10, fontWeight: 400 }}>ر.س</span></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 22, background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}33`, borderRadius: 14, padding: "14px 18px", fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.8 }}>
        🛍️ لطلب أي منتج، تواصل مع إدارة الأكاديمية أو اطلبه مباشرة في مقر الأكاديمية.
      </div>
    </div>
  );
}
