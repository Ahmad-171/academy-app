export const memberships = [
  { name: "فضية",  color: "#c0c0c0", bg: "linear-gradient(135deg,#2a2a3a,#4a4a6a)", features: ["حضور التدريبات","متابعة الحضور","تقارير أساسية"], icon: "🥈" },
  { name: "ذهبية", color: "#f5c842", bg: "linear-gradient(135deg,#3d3000,#7a6000)", features: ["كل مزايا الفضية","السجل الطبي","متجر الأكاديمية","أولوية التسجيل"], icon: "🥇", popular: true },
  { name: "ماسية", color: "#b9f2ff", bg: "linear-gradient(135deg,#002244,#004488)", features: ["جميع المزايا","استشارات خاصة","خصم على الاشتراك","دعم أولوية"], icon: "💎" },
];

export const SUBSCRIPTION_PLANS = [
  { id: "1m", label: "اشتراك شهر",   months: 1, price: 250 },
  { id: "2m", label: "اشتراك شهرين", months: 2, price: 450 },
  { id: "3m", label: "اشتراك 3 شهور", months: 3, price: 600 },
];

export const PRODUCT_SIZES = ["34", "36", "38", "M", "L", "XL", "XXL"];

export const PLAYER_CATEGORIES = ["براعم", "أشبال", "ناشئين", "شباب"];

export const PERMISSION_LABELS = {
  editSchedule:      "تعديل الحضور والانصراف",
  editData:          "تعديل بيانات اللاعبين",
  sendNotifications: "إرسال الفعاليات والرسائل",
  editRatings:       "تعديل التقييمات",
  editMedical:       "تعديل السجل الطبي",
  editLibrary:       "إضافة لمعرض الصور",
  editCommerce:      "تعديل الاشتراكات والمتجر",
};

export const ROLE_TABS = {
  "مدير":    ["home","players","subscriptions","memberships","store","notifications","library","about","admin"],
  "مدرب":    ["home","players","notifications","library","about"],
  "لاعب":    ["home","subscriptions","memberships","store","notifications","library","about"],
  "ولي أمر": ["home","mychild","subscriptions","memberships","store","notifications","library","about"],
};

export const ALL_TABS = [
  { id: "home",          icon: "🏠", label: "الرئيسية" },
  { id: "players",       icon: "📋", label: "تسجيل اللاعبين" },
  { id: "mychild",       icon: "👨‍👦", label: "ملف ولدي" },
  { id: "subscriptions", icon: "💳", label: "الاشتراكات" },
  { id: "memberships",   icon: "💎", label: "العضويات" },
  { id: "store",         icon: "🛒", label: "المتجر" },
  { id: "notifications", icon: "📢", label: "الفعاليات والرسائل" },
  { id: "library",       icon: "🖼️", label: "معرض الصور" },
  { id: "about",         icon: "ℹ️", label: "حول" },
  { id: "admin",         icon: "🔐", label: "الإدارة" },
];
