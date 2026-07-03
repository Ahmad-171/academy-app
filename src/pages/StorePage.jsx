import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import { useWindowSize } from "../hooks/useWindowSize";
import { useToast } from "../hooks/useToast";
import { Modal, ToastMsg } from "../components/ui";

export function StorePage({ products = [], setProducts, user }) {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("الكل");
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { isDesktop } = useWindowSize();
  const { toast, show } = useToast();

  const filtered = category === "الكل" ? products : products.filter(p => p.category === category);
  const total = cart.reduce((s, p) => s + p.price, 0);

  const checkout = async () => {
    if (cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    const { data: order, error } = await supabase.from('orders')
      .insert({ user_id: user.id, total }).select().single();
    if (error || !order) { show(`⚠️ تعذّر إتمام الشراء: ${error?.message || ''}`, COLORS.danger); setCheckingOut(false); return; }
    await supabase.from('order_items').insert(
      cart.map(item => ({ order_id: order.id, product_id: item.id, product_name: item.name, price: item.price }))
    );
    setCart([]);
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
            <div style={{ fontSize: isDesktop ? 52 : 44, marginBottom: 8, background: COLORS.surface, borderRadius: 12, padding: "12px" }}>{p.img}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 8 }}>{p.category}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.accentGold, marginBottom: 10 }}>{p.price} <span style={{ fontSize: 10, fontWeight: 400 }}>ر.س</span></div>
            <button onClick={() => { setCart(prev => [...prev, p]); show(`✅ تم إضافة ${p.name}`); }}
              style={{ width: "100%", padding: "8px", background: COLORS.accent, border: "none", color: "#000", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>أضف للسلة</button>
          </div>
        ))}
      </div>

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
                    <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: COLORS.accentGold, fontWeight: 700 }}>{item.price} ر.س</span>
                    <button onClick={() => setCart(prev => prev.filter((_, j) => j !== i))} style={{ background: COLORS.danger + "22", border: "none", color: COLORS.danger, borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "12px 0", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, color: COLORS.textPrimary }}>الإجمالي</span>
                <span style={{ fontWeight: 900, color: COLORS.accentGold, fontSize: 18 }}>{total} ر.س</span>
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
