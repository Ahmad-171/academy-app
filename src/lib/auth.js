import { supabase } from "./supabase";

const EMAIL_DOMAIN = "academy.local";

function syntheticEmail(id) {
  return `${id}@${EMAIL_DOMAIN}`;
}

// يسجّل الدخول بنفس رقم الهوية وكلمة السر المعتادة، عبر Supabase Auth
// الحقيقي خلف الكواليس (بريد وهمي مبني على رقم الهوية).
export async function signIn(id, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail(id),
    password,
  });
  return { session: data?.session ?? null, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

// يُستخدم من لوحة المدير عند إنشاء حساب جديد: ينشئ حساب Auth حقيقي
// ويرجع auth_uid لربطه بصف users.
export async function signUpAccount(id, password) {
  const { data, error } = await supabase.auth.signUp({
    email: syntheticEmail(id),
    password,
  });
  return { authUid: data?.user?.id ?? null, error };
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
