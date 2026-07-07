// ══════════════════════════════════════════════════════════════
// سكربت ترحيل الحسابات الحالية إلى Supabase Auth.
// يُشغَّل مرة واحدة، بعد تنفيذ supabase/09_auth_setup.sql وقبل 10_rls_policies.sql.
//
// المتطلبات:
//   1. عطّل "Confirm email" في Supabase → Authentication → Providers → Email.
//   2. شغّل: node scripts/migrate-to-auth.mjs
//
// لكل مستخدم بلا auth_uid: يُنشئ حساب Auth بالبريد {id}@academy.local
// وكلمة السر الحالية، ثم يكتب auth_uid في صف المستخدم.
// ══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wpiskutcxqcubamnmnbf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E-r_JsMpVkWeta-oOVsILQ_ur8n-85e";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const emailFor = (id) => `${String(id).trim()}@academy.local`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { data: users, error } = await supabase.from("users").select("id, password, auth_uid, name");
  if (error) { console.error("تعذّر قراءة المستخدمين:", error.message); process.exit(1); }

  const pending = users.filter((u) => !u.auth_uid);
  console.log(`إجمالي المستخدمين: ${users.length} — بحاجة للترحيل: ${pending.length}`);

  let ok = 0, fail = 0;
  for (const u of pending) {
    if (!u.password) { console.warn(`⏭️  ${u.id} (${u.name}) — لا كلمة سر، تخطٍّ`); continue; }
    const { data, error: signErr } = await supabase.auth.signUp({ email: emailFor(u.id), password: String(u.password) });
    if (signErr) { console.error(`❌ ${u.id}: ${signErr.message}`); fail++; await sleep(400); continue; }
    const authUid = data.user?.id;
    if (!authUid) { console.error(`❌ ${u.id}: لم يُرجَع معرّف الحساب (تأكد من تعطيل تأكيد البريد)`); fail++; continue; }

    const { error: updErr } = await supabase.from("users").update({ auth_uid: authUid }).eq("id", u.id);
    if (updErr) { console.error(`❌ ${u.id} (ربط الصف): ${updErr.message}`); fail++; continue; }
    console.log(`✅ ${u.id} (${u.name})`);
    ok++;
    await sleep(400); // تفادي حدود المعدّل
  }

  console.log(`\nتم: ${ok} ناجح، ${fail} فاشل.`);
  console.log("بعد نجاح الترحيل: شغّل supabase/10_rls_policies.sql ثم 11_finalize_drop_password.sql");
}

main();
