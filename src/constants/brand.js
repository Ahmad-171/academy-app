// هوية الموقع (الاسم، الشعار النصي، وبطاقات شاشة الدخول) — قابلة للتعديل من حساب المبرمج.
// تُخزَّن في جدول settings تحت المفتاح 'brand' وتُطبَّق وقت التشغيل على كائن BRAND
// المتغيّر (نفس أسلوب COLORS)، فتظهر التعديلات في كل الصفحات فورًا.

export const DEFAULT_BRAND = {
  name: "NZ Academy",
  tagline: "أكاديمية كرة القدم",
  features: [
    ["⚽", "متابعة اللاعبين", "تقييمات وحضور وملاحظات"],
    ["💳", "الاشتراكات", "باقات ومدفوعات إلكترونية"],
    ["📢", "الفعاليات والرسائل", "تواصل مباشر مع الأعضاء"],
    ["🎫", "حضور بالباركود", "تسجيل سريع وآمن"],
  ],
};

// كائن متغيّر تقرأه كل الصفحات وقت العرض.
export const BRAND = {
  name: DEFAULT_BRAND.name,
  tagline: DEFAULT_BRAND.tagline,
  features: DEFAULT_BRAND.features.map(f => [...f]),
};

// تطبيق قيم محفوظة (جزئية) على الكائن الحيّ.
export function applyBrand(partial) {
  if (!partial || typeof partial !== "object") return;
  if (typeof partial.name === "string" && partial.name.trim()) BRAND.name = partial.name;
  if (typeof partial.tagline === "string") BRAND.tagline = partial.tagline;
  if (Array.isArray(partial.features) && partial.features.length) {
    BRAND.features = partial.features.map(f => Array.isArray(f) ? [f[0] || "", f[1] || "", f[2] || ""] : f);
  }
}

export function resetBrand() {
  BRAND.name = DEFAULT_BRAND.name;
  BRAND.tagline = DEFAULT_BRAND.tagline;
  BRAND.features = DEFAULT_BRAND.features.map(f => [...f]);
}
