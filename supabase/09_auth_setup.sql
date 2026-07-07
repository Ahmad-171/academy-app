-- ══════════════════════════════════════════════════════════════
-- الخطوة 1 من تأمين الموقع: ربط جدول users بـ Supabase Auth + دوال مساعدة
-- شغّل هذا الملف أولًا في Supabase SQL Editor (قبل سكربت الترحيل).
-- ملاحظة: لا يُفعّل RLS بعد — يبقى الجدول مفتوحًا حتى ينتهي الترحيل.
-- ══════════════════════════════════════════════════════════════

-- عمود يربط كل مستخدم بحساب المصادقة الخاص به
alter table users add column if not exists auth_uid uuid references auth.users(id) on delete set null;
create index if not exists users_auth_uid_idx on users(auth_uid);

-- صف المستخدم الحالي حسب جلسة المصادقة
create or replace function current_academy_user()
returns users as $$
  select * from users where auth_uid = auth.uid() limit 1;
$$ language sql security definer stable;

-- هل المستخدم الحالي مدير؟
create or replace function is_admin()
returns boolean as $$
  select coalesce((select role = 'مدير' from users where auth_uid = auth.uid() limit 1), false);
$$ language sql security definer stable;

-- هل يملك المستخدم الحالي صلاحية معيّنة (أو أنه مدير)؟
create or replace function has_perm(p text)
returns boolean as $$
  select coalesce((
    select role = 'مدير' or coalesce((permissions->>p)::boolean, false)
    from users where auth_uid = auth.uid() limit 1
  ), false);
$$ language sql security definer stable;

-- رقم هوية المستخدم الحالي
create or replace function my_id()
returns text as $$
  select id from users where auth_uid = auth.uid() limit 1;
$$ language sql security definer stable;

-- رقم هوية ابن المستخدم الحالي (لولي الأمر)
create or replace function my_child_id()
returns text as $$
  select child_id from users where auth_uid = auth.uid() limit 1;
$$ language sql security definer stable;
