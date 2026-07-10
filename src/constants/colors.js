// الألوان الافتراضية للموقع
export const DEFAULT_COLORS = {
  darkBg: "#0a0e1a", cardBg: "#0f1628", surface: "#151d35",
  border: "#1e2d50", accent: "#00c896", accentGold: "#f5c842",
  accentBlue: "#3b82f6", textPrimary: "#f0f4ff", textSecondary: "#7a8bb5",
  danger: "#ef4444", warning: "#f59e0b", purple: "#a855f7",
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
