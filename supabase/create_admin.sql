-- ══════════════════════════════════════════════════════════════
-- إنشاء (أو إصلاح) حساب مدير تدخل فيه فورًا.
-- غيّر القيم الثلاث بالأعلى إن رغبت، ثم شغّل الملف كاملًا في SQL Editor.
-- تسجيل الدخول بعدها: رقم الهوية = v_id ، كلمة السر = v_pass
-- آمن لإعادة التشغيل (يُحدّث الحساب إن كان موجودًا).
-- ══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;
alter table public.users add column if not exists auth_uid uuid references auth.users(id) on delete set null;

do $$
declare
  v_id    text := '111';   -- رقم الهوية للدخول
  v_pass  text := '111';   -- كلمة السر
  v_name  text := 'المدير';
  v_email text;
  v_uid   uuid;
begin
  v_email := lower(trim(v_id)) || '@academy.local';

  -- 1) حساب المصادقة: أنشئه إن لم يوجد، وإلا أعد ضبط كلمة السر
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt(v_pass, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );
  else
    update auth.users
       set encrypted_password = crypt(v_pass, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_uid;
  end if;

  -- 2) سجل الهوية (identity) — مطلوب حتى يعمل تسجيل الدخول بالبريد وكلمة السر
  if not exists (select 1 from auth.identities where user_id = v_uid and provider = 'email') then
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;

  -- 3) صف المستخدم في جدول users كمدير (اربطه إن وُجد، وإلا أنشئه)
  if exists (select 1 from public.users where id = v_id) then
    update public.users set auth_uid = v_uid, role = 'مدير', status = 'نشط' where id = v_id;
  else
    insert into public.users (id, auth_uid, name, role, custom_role, status, permissions, points, attendance)
    values (v_id, v_uid, v_name, 'مدير', 'مدير', 'نشط', '{}'::jsonb, 0, 0);
  end if;
end $$;
