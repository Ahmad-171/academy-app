-- =====================================================================
-- أكاديمية النجوم — الخطوة ٤: إنهاء ترحيل الأمان
-- =====================================================================
-- شغّل هذا الملف فقط بعد:
--   1) supabase/01_add_auth_column.sql
--   2) scripts/migrate-to-auth.mjs
--   3) supabase/02_enable_rls.sql
-- تحقق أولاً أن الاستعلام التالي يرجع صفر صفوف:
--   select id, name from public.users where auth_uid is null;
--
-- بعد هذا الملف: كلمات السر تختفي نهائيًا من قاعدة البيانات كنص صريح،
-- والدخول يتم فقط عبر supabase.auth.signInWithPassword.
-- =====================================================================

do $$
declare
  missing_count integer;
begin
  select count(*) into missing_count from public.users where auth_uid is null;
  if missing_count > 0 then
    raise exception 'يوجد % مستخدم بدون auth_uid — شغّل scripts/migrate-to-auth.mjs أولاً', missing_count;
  end if;
end $$;

alter table public.users drop column if exists password;
alter table public.users drop column if exists medical;

alter table public.users alter column auth_uid set not null;
