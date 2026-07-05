import { supabase } from "./supabase";

// التحقق من كود خصم: موجود، مفعّل، ولم يتجاوز حد الاستخدام.
export async function validateDiscountCode(raw) {
  const code = (raw || "").trim().toUpperCase();
  if (!code) return { error: "أدخل كود الخصم" };
  const { data } = await supabase.from('discount_codes').select('*').eq('code', code).maybeSingle();
  if (!data || !data.active) return { error: "كود الخصم غير صحيح" };
  if (data.max_uses != null && (data.used_count || 0) >= data.max_uses) {
    return { error: "انتهى عدد استخدامات هذا الكود" };
  }
  return { code, percent: Number(data.percent_off) };
}

// يُستدعى بعد إتمام عملية ناجحة استخدمت الكود — يزيد عدّاد الاستخدام.
export async function consumeDiscountCode(code) {
  if (!code) return;
  const { data } = await supabase.from('discount_codes').select('used_count').eq('code', code).maybeSingle();
  if (data) {
    await supabase.from('discount_codes').update({ used_count: (data.used_count || 0) + 1 }).eq('code', code);
  }
}
