-- ══════════════════════════════════════════════════════════════
-- الخطوة 2 (بديل SQL عن سكربت node): إنشاء حسابات مصادقة للمستخدمين الحاليين.
-- شغّل هذا بعد 09_auth_setup.sql. لكل مستخدم بلا auth_uid يُنشئ حساب دخول
-- بالبريد {رقم_الهوية}@academy.local وكلمة سره الحالية (مشفّرة)، ويربطه بملفه.
-- آمن لإعادة التشغيل (يتجاهل الحسابات المربوطة مسبقًا).
-- ══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

do $migrate$
declare
  r record;
  new_uid uuid;
  em text;
begin
  for r in select id, password from public.users where auth_uid is null and password is not null loop
    new_uid := gen_random_uuid();
    em := lower(trim(r.id)) || '@academy.local';

    -- تجاوز إن كان البريد موجودًا مسبقًا في المصادقة
    if exists (select 1 from auth.users where email = em) then
      update public.users set auth_uid = (select id from auth.users where email = em) where id = r.id;
      continue;
    end if;

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      em, crypt(r.password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      new_uid::text, new_uid,
      jsonb_build_object('sub', new_uid::text, 'email', em, 'email_verified', true),
      'email', now(), now(), now()
    );

    update public.users set auth_uid = new_uid where id = r.id;
  end loop;
end $migrate$;

-- تحقّق: يجب أن يكون العدد 0
-- select count(*) from public.users where auth_uid is null;
