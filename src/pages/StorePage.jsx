import { useState } from "react";
import { supabase } from "../lib/supabase";
import { validateDiscountCode, consumeDiscountCode } from "../lib/discounts";
import { COLORS } from "../constants/colors";
import { PRODUCT_SIZES } from "../constants/data";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Modal, Field, ToastMsg } from "../components/ui";

export function StorePage({ products = [], setProducts, user }) {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("الكل");
  const [showCart, setShowCart] = useState(false);
  const [sizeModal, setSizeModal] = useState(null);
  const [chosenSize, setChosenSize] = useState(PRODUCT_SIZES[0]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const filtered = category === "الكل" ? products : products.filter(p => p.category === category);
  const subtotal = cart.reduce((s, p) => s + p.price, 0);
  const total = Math.round(subtotal * (1 - (discount || 0) / 100));

  const addToCart = () => {
    setCart(prev => [...prev, { ...sizeModal, size: chosenSize }]);
    show(`✅ تم إضافة ${sizeModal.name} (${chosenSize})`);
    setSizeModal(null);
  };

  const applyCode = async () => {
    if (!code.trim()) return;
    const result = await validateDiscountCode(code);
    if (result.error) { setDiscount(null); show(`⚠️ ${result.error}`, COLORS.warning); return; }
    setDiscount(result.percent);
    show(`✅ تم تطبيق خصم ${result.percent}٪`);
  };

  const checkout = async () => {
    if (cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    const discountCode = discount ? code.trim().toUpperCase() : null;
    // إعادة التحقق لحظة الشراء — قد يكون الكود انتهى استخدامه بعد تطبيقه
    if (discountCode) {
      const recheck = await validateDiscountCode(discountCode);
      if (recheck.error) {
        setDiscount(null);
        show(`⚠️ ${recheck.error}`, COLORS.warning);
        setCheckingOut(false);
        return;
      }
    }
    const { error } = await supabase.from('store_orders').insert(
      cart.map(item => ({ user_id: user.id, product_name: item.name, size: item.size, amount: item.price, discount_code: discountCode }))
    );
    if (error) { show(`⚠️ تعذّر إتمام الشراء: ${error.message}`, COLORS.danger); setCheckingOut(false); return; }
    await consumeDiscountCode(discountCode);
    setCart([]);
    setCode(""); setDiscount(null);
    setShowCart(false);
    setCheckingOut(false);
    show("✅ تم إتمام الشراء بنجاح!");
  };

  return (
    <div style={{ padding: isDesktop ? "32px" : "16px" }}>
      {toast && <ToastMsg msg={toast.msg} color={toast.color} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: COLORS.textPrimary }}>🛒 المتجر</div>
        <button onClick={() => setShowCart(true)} style={{ background: cart.length > 0 ? COLORS.accent : COLORS.cardBg, color: cart.length > 0 ? "#000" : COLORS.textSecondary, border: `1px solid ${cart.length > 0 ? COLORS.accent : COLORS.border}`, borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          🛒 {cart.length > 0 ? `${cart.length} منتج` : "السلة"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {["الكل", "ملابس", "إكسسوار", "حقائب", "معدات"].map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 20, background: category === c ? COLORS.accent : COLORS.cardBg, border: `1px solid ${category === c ? COLORS.accent : COLORS.border}`, color: category === c ? "#000" : COLORS.textSecondary, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12 }}>
        {filtered.map((p, i) => (
          <div key={i} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 15, padding: 14, textAlign: "center" }}>
            {p.images?.[0] ? (
              <div style={{ height: isDesktop ? 130 : 110, marginBottom: 8, background: COLORS.surface, borderRadius: 12, overflow: "hidden" }}>
                <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ fontSize: isDesktop ? 52 : 44, marginBottom: 8, background: COLORS.surface, borderRadius: 12, padding: "12px" }}>{p.img}</div>
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 8 }}>{p.category}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.accentGold, marginBottom: 10 }}>{p.price} <span style={{ fontSize: 10, fontWeight: 400 }}>ر.س</span></div>
            <button onClick={() => { setSizeModal(p); setChosenSize(PRODUCT_SIZES[0]); }}
              style={{ width: "100%", padding: "8px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>أضف للسلة</button>
          </div>
        ))}
      </div>

      {/* اختيار المقاس */}
      {sizeModal && (
        <Modal title={`${sizeModal.name} — اختر المقاس`} onClose={() => setSizeModal(null)}>
          <Field label="المقاس" value={chosenSize} onChange={setChosenSize} options={PRODUCT_SIZES} />
          <button onClick={addToCart} style={{ width: "100%", padding: "12px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 11, fontWeight: 800, cursor: "pointer" }}>✅ إضافة للسلة</button>
        </Modal>
      )}

      {showCart && (
        <Modal title="🛒 سلة المشتريات" onClose={() => setShowCart(false)}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", color: COLORS.textSecondary }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
              <div>السلة فارغة</div>
            </div>
          ) : (
            <>
              {cart.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{item.img}</span>
                    <div>
                      <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>المقاس: {item.size}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: COLORS.accentGold, fontWeight: 700 }}>{item.price} ر.س</span>
                    <button onClick={() => setCart(prev => prev.filter((_, j) => j !== i))} style={{ background: COLORS.danger + "22", border: "none", color: COLORS.danger, borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600 }}>كود الخصم (اختياري)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={code} onChange={e => setCode(e.target.value)} placeholder="مثال: WELCOME10"
                    style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, padding: "9px 12px", fontSize: 13, boxSizing: "border-box" }} />
                  <button onClick={applyCode} style={{ padding: "0 16px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>تطبيق</button>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "12px 0", borderTop: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: 13 }}>المجموع الفرعي</span>
                  <span style={{ color: COLORS.textPrimary, fontSize: 13 }}>{subtotal} ر.س</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: COLORS.accent, fontSize: 13 }}>الخصم ({discount}٪)</span>
                    <span style={{ color: COLORS.accent, fontSize: 13 }}>-{subtotal - total} ر.س</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, color: COLORS.textPrimary }}>الإجمالي</span>
                  <span style={{ fontWeight: 900, color: COLORS.accentGold, fontSize: 18 }}>{total} ر.س</span>
                </div>
              </div>
              <button onClick={checkout} disabled={checkingOut}
                style={{ width: "100%", marginTop: 8, padding: "13px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{checkingOut ? "جاري التنفيذ..." : "✓ إتمام الشراء"}</button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
