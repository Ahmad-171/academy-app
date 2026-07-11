import { supabase } from "./supabase";

// المصادقة عبر Supabase Auth. رقم الهوية يُحوّل لبريد اصطناعي داخلي،
// وكلمة السر تبقى في Supabase Auth فقط (لا تُخزَّن في جدول users بعد الترحيل).
const emailFor = (id) => `${String(id).trim()}@academy.local`;

// تحويل أعمدة قاعدة البيانات إلى الشكل الذي يستخدمه الواجهة
export function mapUser(u) {
  return { ...u, customRole: u.custom_role, childId: u.child_id, coachId: u.coach_id, attendanceLog: u.attendance_log || [] };
}

async function profileForAuthUid(authUid) {
  const { data } = await supabase.from("users").select("*").eq("auth_uid", authUid).maybeSingle();
  return data ? mapUser(data) : null;
}

// يعيد المستخدم الحالي من الجلسة النشطة (لاستعادة الجلسة بعد تحديث الصفحة)
export async function currentUserFromSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return profileForAuthUid(session.user.id);
}

// تسجيل الدخول برقم الهوية وكلمة السر
export async function signIn(id, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailFor(id), password });
  if (error || !data?.user) return { error: "رقم الهوية أو كلمة السر غير صحيحة" };
  const profile = await profileForAuthUid(data.user.id);
  if (!profile) { await supabase.auth.signOut(); return { error: "لا يوجد ملف مرتبط بهذا الحساب — تواصل مع الإدارة" }; }
  if (profile.status === "موقوف") { await supabase.auth.signOut(); return { error: "هذا الحساب موقوف، تواصل مع الإدارة" }; }
  return { user: profile };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => cb(session));
}

// إنشاء حساب جديد (يستدعيه المدير). يتم عبر دالة create_member في القاعدة:
// تخصّص رقم عضوية (يبدأ من 10000)، وتُنشئ حساب المصادقة بريده = رقم العضوية،
// ثم نُكمّل باقي بيانات الملف. لا يمرّ على بريد التأكيد (لا حدود إرسال).
export async function createAccount({ id, password, profile }) {
  const { data: membershipNo, error } = await supabase.rpc("create_member", {
    p_id: id, p_pass: password, p_name: profile.name, p_role: profile.role, p_hidden: !!profile.hidden,
  });
  if (error) return { error: error.message };
  const { error: updErr } = await supabase.from("users").update(profile).eq("id", id);
  if (updErr) return { error: updErr.message };
  return { ok: true, membershipNo };
}

// إعادة تعيين كلمة سر أي عضو (للمدير/المبرمج) — بدون معرفة القديمة
export async function resetMemberPassword(userId, newPass) {
  const { error } = await supabase.rpc("reset_member_password", { p_user_id: userId, p_new_pass: newPass });
  return { error: error?.message };
}

// تغيير المستخدم كلمة سره بنفسه
export async function changeMyPassword(newPass) {
  const { error } = await supabase.auth.updateUser({ password: newPass });
  return { error: error?.message };
}
