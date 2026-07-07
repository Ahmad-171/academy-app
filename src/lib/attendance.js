import { supabase } from "./supabase";

// إجراءات الحضور المشفّرة داخل الباركود
export const ATT_ACTIONS = { IN: "IN", OUT: "OUT" };
export const todayStr = () => new Date().toISOString().slice(0, 10);

const genToken = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const SETTING_KEY = "attendance_daily";

// يقرأ توكن اليوم من الإعدادات بدون إنشاء — يُستخدم للتحقق عند مسح اللاعب
export async function readDailyToken() {
  const { data } = await supabase.from("settings").select("value").eq("key", SETTING_KEY).maybeSingle();
  if (!data?.value) return null;
  try { return JSON.parse(data.value); } catch { return null; }
}

// يُنشئ توكن اليوم إن لم يوجد أو كان من يوم سابق — يُستخدم في شاشة عرض المدير
export async function getOrCreateDailyToken() {
  const existing = await readDailyToken();
  if (existing && existing.date === todayStr()) return existing;
  const fresh = { date: todayStr(), token: genToken() };
  await supabase.from("settings").upsert({ key: SETTING_KEY, value: JSON.stringify(fresh) });
  return fresh;
}

// يولّد باركودًا جديدًا للحين (زر تحديث في شاشة المدير)
export async function rotateDailyToken() {
  const fresh = { date: todayStr(), token: genToken() };
  await supabase.from("settings").upsert({ key: SETTING_KEY, value: JSON.stringify(fresh) });
  return fresh;
}

// يسجّل حضور/انصراف اللاعب لنفسه. يرجّع { ok, message }
export async function recordAttendance(playerId, action) {
  const day = todayStr();
  const { data: row } = await supabase.from("attendance_log").select("*").eq("user_id", playerId).eq("day", day).maybeSingle();
  const nowIso = new Date().toISOString();

  if (action === ATT_ACTIONS.IN) {
    if (row && row.check_in) return { ok: false, message: "حضورك مسجّل مسبقًا اليوم" };
    const { error } = await supabase.from("attendance_log").upsert({ user_id: playerId, day, check_in: nowIso }, { onConflict: "user_id,day" });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "تم تسجيل حضورك" };
  }

  // انصراف
  if (!row || !row.check_in) return { ok: false, message: "سجّل حضورك أولاً قبل الانصراف" };
  if (row.check_out) return { ok: false, message: "انصرافك مسجّل مسبقًا اليوم" };
  const { error } = await supabase.from("attendance_log").update({ check_out: nowIso }).eq("user_id", playerId).eq("day", day);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "تم تسجيل انصرافك" };
}
