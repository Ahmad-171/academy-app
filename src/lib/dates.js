// تاريخ اليوم بصيغة YYYY-MM-DD بالتوقيت المحلي (بدون انزياح UTC)
export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// إضافة عدد من الأشهر لتاريخ اليوم وإرجاع YYYY-MM-DD محليًا
export function addMonthsLocal(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + Number(months || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
