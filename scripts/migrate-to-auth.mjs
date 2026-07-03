// أكاديمية النجوم — ترحيل حسابات users إلى Supabase Auth حقيقي.
//
// شغّله مرة واحدة من جذر المشروع بعد تشغيل supabase/01_add_auth_column.sql
// وقبل تشغيل supabase/02_enable_rls.sql:
//
//   node scripts/migrate-to-auth.mjs
//
// يقرأ كل مستخدم من جدول users بدون auth_uid، ينشئ له حساب Auth ببريد
// وهمي {id}@academy.local ونفس كلمة السر الحالية، ثم يربط auth_uid.
// رقم الهوية وكلمة السر التي يدخل بها المستخدم النهائي لا تتغيران.
//
// تأكد أولاً أنك عطّلت "Confirm email" من
// Authentication → Providers → Email بلوحة Supabase، وإلا الحسابات
// المُنشأة تبقى غير مفعّلة حتى تأكيد البريد (وهمي، لن يصل).
//
// تنبيه: Supabase Auth يفرض حدًا أدنى لطول كلمة السر (٦ أحرف افتراضيًا).
// حسابات العرض التجريبي الحالية (111 / 221 ...) أقصر من ذلك وستفشل هنا
// حتى تُغيّر كلمات السر لتصبح ٦ أحرف فأكثر، أو تخفّض "Minimum password
// length" من Authentication → Providers → Email → Password Requirements.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpiskutcxqcubamnmnbf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-r_JsMpVkWeta-oOVsILQ_ur8n-85e';
const EMAIL_DOMAIN = 'academy.local';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function syntheticEmail(id) {
  return `${id}@${EMAIL_DOMAIN}`;
}

async function main() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, password, auth_uid');

  if (error) {
    console.error('فشل جلب المستخدمين:', error.message);
    process.exit(1);
  }

  const pending = users.filter(u => !u.auth_uid);
  if (pending.length === 0) {
    console.log('كل المستخدمين مرتبطون بحساب Auth مسبقًا. لا شيء للترحيل.');
    return;
  }

  console.log(`سيتم ترحيل ${pending.length} حساب...`);
  let ok = 0, failed = 0;

  for (const user of pending) {
    const email = syntheticEmail(user.id);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: user.password,
    });

    if (signUpError || !data.user) {
      console.error(`✗ ${user.id} (${user.name}):`, signUpError?.message || 'لم يُنشأ المستخدم');
      failed++;
      await supabase.auth.signOut().catch(() => {});
      continue;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ auth_uid: data.user.id })
      .eq('id', user.id);

    if (updateError) {
      console.error(`✗ ${user.id} (${user.name}): تم إنشاء حساب Auth لكن فشل الربط:`, updateError.message);
      failed++;
    } else {
      console.log(`✓ ${user.id} (${user.name})`);
      ok++;
    }

    // تصفير الجلسة قبل معالجة المستخدم التالي
    await supabase.auth.signOut().catch(() => {});
  }

  console.log(`\nتم: ${ok} نجاح، ${failed} فشل.`);
  if (failed > 0) {
    console.log('راجع الأخطاء أعلاه — الأسباب الشائعة: "Confirm email" مفعّل، أو كلمة سر أقصر من 6 أحرف (حد Supabase الأدنى).');
  }
}

main();
