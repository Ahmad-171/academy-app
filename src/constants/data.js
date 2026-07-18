export const memberships = [
  { name: "فضية",  color: "#c0c0c0", bg: "linear-gradient(135deg,#2a2a3a,#4a4a6a)", features: ["حضور التدريبات","متابعة الحضور","تقارير أساسية"], icon: "🥈", price: 0, desc: "" },
  { name: "ذهبية", color: "#f5c842", bg: "linear-gradient(135deg,#3d3000,#7a6000)", features: ["كل مزايا الفضية","السجل الطبي","متجر الأكاديمية","أولوية التسجيل"], icon: "🥇", popular: true, price: 0, desc: "" },
  { name: "ماسية", color: "#b9f2ff", bg: "linear-gradient(135deg,#002244,#004488)", features: ["جميع المزايا","استشارات خاصة","خصم على الاشتراك","دعم أولوية"], icon: "💎", price: 0, desc: "" },
];

export const SUBSCRIPTION_PLANS = [
  { id: "1m", label: "اشتراك شهر",   months: 1, price: 250, desc: "١٢ حصة تدريبية", category: "عام" },
  { id: "2m", label: "اشتراك شهرين", months: 2, price: 450, desc: "٢٤ حصة تدريبية", category: "عام" },
  { id: "3m", label: "اشتراك 3 شهور", months: 3, price: 600, desc: "٣٦ حصة تدريبية", category: "عام" },
];

// تصنيفات افتراضية (قابلة للتعديل من لوحة الإدارة وتُحفظ في settings)
export const DEFAULT_STORE_CATEGORIES = ["ملابس", "إكسسوار", "حقائب", "معدات"];
export const DEFAULT_SUB_CATEGORIES = ["عام"];

// معلومات الفرع (تظهر أعلى الصفحة الرئيسية، قابلة للتعديل من المدير)
export const DEFAULT_BRANCH_INFO = {
  place: "حي طيبة - مدارس منارات النخبة الأهلية",
  days: "الأحد - الثلاثاء - الخميس",
  time: "من ٥م إلى ٧م",
};

// بيانات السداد (تظهر عند اختيار اشتراك/عضوية، قابلة للتعديل من المدير)
export const DEFAULT_PAYMENT_INFO = {
  bank: "مصرف الإنماء",
  iban: "SA6605000068207331127000",
  holder: "مؤسسة مالك إبراهيم",
};

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

// الأدوار ذات صلاحيات المدير الكاملة (المدير + المبرمج).
// «مبرمج» مثل المدير تمامًا، ويرى الحسابات المخفية.
export const isManager = (user) => user?.role === "مدير" || user?.role === "مبرمج";

export const ROLE_TABS = {
  "مبرمج":   ["home","players","subscriptions","memberships","store","notifications","library","about","admin"],
  "مدير":    ["home","players","subscriptions","memberships","store","notifications","library","about","admin"],
  "مدرب":    ["home","players","notifications","library","about"],
  "لاعب":    ["home","myrecord","subscriptions","memberships","store","notifications","library","about"],
  "ولي أمر": ["home","mychild","subscriptions","memberships","store","notifications","library","about"],
};

export const ALL_TABS = [
  { id: "home",          icon: "🏠", label: "الرئيسية" },
  { id: "players",       icon: "📋", label: "تسجيل اللاعبين" },
  { id: "myrecord",      icon: "👤", label: "ملفي" },
  { id: "mychild",       icon: "👨‍👦", label: "ملف ولدي" },
  { id: "subscriptions", icon: "💳", label: "الاشتراكات" },
  { id: "memberships",   icon: "💎", label: "العضويات" },
  { id: "store",         icon: "🛒", label: "المتجر" },
  { id: "notifications", icon: "📢", label: "الفعاليات والرسائل" },
  { id: "library",       icon: "🖼️", label: "معرض الصور" },
  { id: "about",         icon: "ℹ️", label: "حول" },
  { id: "admin",         icon: "🔐", label: "الإدارة" },
];
