export const memberships = [
  { name: "برونزي", color: "#cd7f32", bg: "linear-gradient(135deg,#3d2b1f,#6b4226)", price: "٢٥٠", features: ["حضور التدريبات","متابعة الحضور","تقارير أساسية"], icon: "🥉" },
  { name: "فضي",    color: "#c0c0c0", bg: "linear-gradient(135deg,#2a2a3a,#4a4a6a)", price: "٤٥٠", features: ["كل مزايا البرونزي","نظام النقاط","المكتبة","تقييمات مفصلة"], icon: "🥈" },
  { name: "ذهبي",   color: "#f5c842", bg: "linear-gradient(135deg,#3d3000,#7a6000)", price: "٦٥٠", features: ["كل مزايا الفضي","السجل الطبي","متجر الأكاديمية","أولوية البطولات"], icon: "🥇", popular: true },
  { name: "ماسي",   color: "#b9f2ff", bg: "linear-gradient(135deg,#002244,#004488)", price: "٩٥٠", features: ["جميع المزايا","استشارات خاصة","خصم ٢٠٪","دعم أولوية"], icon: "💎" },
];

export const financialData = [
  { month: "يناير",  revenue: 48000, expenses: 22000 },
  { month: "فبراير", revenue: 52000, expenses: 24000 },
  { month: "مارس",   revenue: 61000, expenses: 25000 },
  { month: "أبريل",  revenue: 58000, expenses: 23000 },
  { month: "مايو",   revenue: 67000, expenses: 26000 },
  { month: "يونيو",  revenue: 72000, expenses: 28000 },
];

export const PERMISSION_LABELS = {
  editSchedule:      "تعديل الجداول والمواعيد",
  editData:          "تعديل البيانات الشخصية",
  sendNotifications: "إرسال الإشعارات",
  editRatings:       "تعديل تقييمات اللاعبين",
  editMedical:       "تعديل السجل الطبي",
  editLibrary:       "إضافة للمكتبة",
  editTournaments:   "تعديل البطولات والهدافين",
};

export const ROLE_TABS = {
  "مدير":    ["home","schedule","tournaments","rewards","store","profile","notifications","subscriptions","library","admin"],
  "مدرب":    ["home","schedule","tournaments","profile","notifications","library"],
  "لاعب":    ["home","schedule","tournaments","rewards","store","profile","notifications","subscriptions","library"],
  "ولي أمر": ["home","schedule","tournaments","profile","notifications","library"],
};

export const ALL_TABS = [
  { id: "home",          icon: "🏠", label: "الرئيسية" },
  { id: "schedule",      icon: "📅", label: "الجداول" },
  { id: "tournaments",   icon: "🏆", label: "البطولات" },
  { id: "rewards",       icon: "⭐", label: "المكافآت" },
  { id: "store",         icon: "🛒", label: "المتجر" },
  { id: "profile",       icon: "👤", label: "الملف" },
  { id: "notifications", icon: "🔔", label: "الإشعارات" },
  { id: "subscriptions", icon: "💳", label: "الاشتراك" },
  { id: "library",       icon: "📚", label: "المكتبة" },
  { id: "admin",         icon: "🔐", label: "الإدارة" },
];
