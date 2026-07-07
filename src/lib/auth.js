import { createClient } from "@supabase/supabase-js";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase";

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

// إنشاء حساب جديد (يستدعيه المدير). نستخدم عميلًا ثانويًا لا يحفظ الجلسة
// حتى لا يتبدّل حساب المدير الحالي عند إنشاء المستخدم في Supabase Auth.
export async function createAccount({ id, password, profile }) {
  const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await tempClient.auth.signUp({ email: emailFor(id), password });
  if (error) return { error: error.message };
  const authUid = data.user?.id;
  if (!authUid) return { error: "تعذّر إنشاء حساب الدخول — تأكد من تعطيل تأكيد البريد في إعدادات Supabase" };

  // صف users يُدرَج عبر جلسة المدير الحالية (سياسات RLS تسمح للمدير)
  const { error: insErr } = await supabase.from("users").insert({ id, auth_uid: authUid, ...profile });
  if (insErr) return { error: insErr.message };
  return { ok: true };
}
