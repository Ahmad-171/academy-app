// الألوان الافتراضية للموقع — خلفية بيضاء وألوان مستمدّة من شعار NZ Academy (تركواز/كحلي)
export const DEFAULT_COLORS = {
  darkBg: "#ffffff", cardBg: "#f3f8fa", surface: "#e9f1f4",
  border: "#d2e0e6", accent: "#1799ae", accentGold: "#c8912a",
  accentBlue: "#2fb0c6", textPrimary: "#0e3a47", textSecondary: "#5c7883",
  danger: "#e04848", warning: "#e0891e", purple: "#0e5a6e",
};

// كائن الألوان الحيّ — تقرأه كل الواجهة. يُعدَّل وقت التشغيل من حساب المبرمج.
export const COLORS = { ...DEFAULT_COLORS };

// تطبيق ألوان مخصّصة (دمج مع الحالية)
export function applyTheme(obj) {
  if (obj && typeof obj === "object") Object.assign(COLORS, obj);
}

// إعادة كل الألوان للافتراضي
export function resetTheme() {
  Object.assign(COLORS, DEFAULT_COLORS);
}
