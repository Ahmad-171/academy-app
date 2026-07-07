-- ══════════════════════════════════════════════════════════════
-- حسابات مخفية: حساب يعمل بشكل طبيعي لكنه لا يظهر في قوائم الحسابات.
-- شغّل هذا مرة واحدة في SQL Editor.
-- ══════════════════════════════════════════════════════════════

alter table public.users add column if not exists hidden boolean default false;

-- ── (اختياري) إنشاء حساب مدير مخفي بكامل الصلاحيات مباشرة عبر SQL ──
-- غيّر القيم الثلاث ثم أزل التعليق عن الكتلة وشغّلها.
/*
create extension if not exists pgcrypto;
do $$
declare
  v_id    text := '9999999999';   -- رقم هوية الحساب المخفي
  v_pass  text := 'Owner@2026';   -- كلمة السر (6 خانات فأكثر)
  v_name  text := 'المالك';
  v_email text; v_uid uuid;
begin
  v_email := lower(trim(v_id)) || '@academy.local';
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
      v_email, crypt(v_pass, gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_uid::text, v_uid, jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());
  else
    update auth.users set encrypted_password = crypt(v_pass, gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = v_uid;
  end if;

  insert into public.users (id, auth_uid, name, role, custom_role, status, permissions, points, attendance, hidden)
  values (v_id, v_uid, v_name, 'مدير', 'مدير', 'نشط', '{}'::jsonb, 0, 0, true)
  on conflict (id) do update set auth_uid = excluded.auth_uid, role = 'مدير', status = 'نشط', hidden = true;
end $$;
*/
