-- =====================================================================
-- أكاديمية النجوم — الخطوة ٣: تفعيل RLS وسياسات الصلاحيات
-- =====================================================================
-- شغّل هذا الملف بعد:
--   1) supabase/01_add_auth_column.sql
--   2) scripts/migrate-to-auth.mjs  (كل مستخدم صار له auth_uid)
-- تحقق أولاً أن لا يوجد صف بدون auth_uid:
--   select id, name from public.users where auth_uid is null;
-- =====================================================================

-- 1) دوال مساعدة (SECURITY DEFINER) تُستخدم داخل كل سياسات RLS
create or replace function public.current_academy_user()
returns public.users
language sql
security definer
stable
set search_path = public
as $$
  select * from public.users where auth_uid = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users where auth_uid = auth.uid() and role = 'مدير'
  );
$$;

create or replace function public.has_permission(perm text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select (permissions ->> perm)::boolean from public.users where auth_uid = auth.uid()),
    false
  ) or public.is_admin();
$$;

create or replace function public.current_user_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select id from public.users where auth_uid = auth.uid() limit 1;
$$;

-- 2) فصل البيانات الطبية عن جدول users لعزلها بسياسات مستقلة
create table if not exists public.medical_records (
  user_id      text primary key references public.users(id) on delete cascade,
  health       text default 'جيدة',
  injuries     text default 'لا يوجد',
  allergies    text default 'لا يوجد',
  medications  text default 'لا يوجد'
);

insert into public.medical_records (user_id, health, injuries, allergies, medications)
select id,
       coalesce(medical->>'health', 'جيدة'),
       coalesce(medical->>'injuries', 'لا يوجد'),
       coalesce(medical->>'allergies', 'لا يوجد'),
       coalesce(medical->>'medications', 'لا يوجد')
from public.users
where medical is not null
on conflict (user_id) do nothing;

-- عمود medical بجدول users يُحذف لاحقًا ضمن 03_finalize.sql
-- (بعد التأكد أن medical_records يحتوي كل السجلات).

-- 3) تفعيل RLS على كل الجداول
alter table public.users              enable row level security;
alter table public.medical_records    enable row level security;
alter table public.schedule           enable row level security;
alter table public.notifications      enable row level security;
alter table public.tournament_teams   enable row level security;
alter table public.tournament_scorers enable row level security;
alter table public.library            enable row level security;
alter table public.products           enable row level security;
alter table public.settings           enable row level security;
alter table public.finance            enable row level security;

-- =====================================================================
-- users
-- =====================================================================
drop policy if exists users_select on public.users;
create policy users_select on public.users for select
  to authenticated
  using (true); -- لا يعود يحتوي password أو medical بعد 03_finalize.sql

drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists users_update on public.users;
create policy users_update on public.users for update
  to authenticated
  using (
    public.is_admin()
    or auth_uid = auth.uid()
    or public.has_permission('editData')
    or public.has_permission('editRatings')
    or public.has_permission('editSchedule') -- تحديث الحضور من الجدول
  );

drop policy if exists users_delete on public.users;
create policy users_delete on public.users for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- medical_records — مقيّد: المدير، صاحب صلاحية editMedical، اللاعب نفسه،
-- أو ولي أمره
-- =====================================================================
drop policy if exists medical_select on public.medical_records;
create policy medical_select on public.medical_records for select
  to authenticated
  using (
    public.is_admin()
    or public.has_permission('editMedical')
    or user_id = public.current_user_id()
    or user_id = (select child_id from public.users where auth_uid = auth.uid())
  );

drop policy if exists medical_upsert on public.medical_records;
create policy medical_upsert on public.medical_records for insert
  to authenticated
  with check (public.is_admin() or public.has_permission('editMedical'));

drop policy if exists medical_update on public.medical_records;
create policy medical_update on public.medical_records for update
  to authenticated
  using (public.is_admin() or public.has_permission('editMedical'));

-- =====================================================================
-- schedule — قراءة عامة، تعديل بصلاحية editSchedule
-- =====================================================================
drop policy if exists schedule_select on public.schedule;
create policy schedule_select on public.schedule for select to authenticated using (true);

drop policy if exists schedule_write on public.schedule;
create policy schedule_write on public.schedule for all
  to authenticated
  using (public.has_permission('editSchedule'))
  with check (public.has_permission('editSchedule'));

-- =====================================================================
-- notifications — قراءة عامة، الإرسال بصلاحية sendNotifications،
-- تعليم "مقروء" متاح للجميع (كل شخص يعلّم إشعاراته هو)
-- =====================================================================
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated using (true);

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert
  to authenticated
  with check (public.has_permission('sendNotifications'));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update
  to authenticated
  using (true);

-- =====================================================================
-- tournament_teams / tournament_scorers — قراءة عامة، تعديل بصلاحية
-- editTournaments
-- =====================================================================
drop policy if exists teams_select on public.tournament_teams;
create policy teams_select on public.tournament_teams for select to authenticated using (true);

drop policy if exists teams_write on public.tournament_teams;
create policy teams_write on public.tournament_teams for all
  to authenticated
  using (public.has_permission('editTournaments'))
  with check (public.has_permission('editTournaments'));

drop policy if exists scorers_select on public.tournament_scorers;
create policy scorers_select on public.tournament_scorers for select to authenticated using (true);

drop policy if exists scorers_write on public.tournament_scorers;
create policy scorers_write on public.tournament_scorers for all
  to authenticated
  using (public.has_permission('editTournaments'))
  with check (public.has_permission('editTournaments'));

-- =====================================================================
-- library — قراءة عامة، إضافة/حذف بصلاحية editLibrary
-- =====================================================================
drop policy if exists library_select on public.library;
create policy library_select on public.library for select to authenticated using (true);

drop policy if exists library_write on public.library;
create policy library_write on public.library for all
  to authenticated
  using (public.has_permission('editLibrary'))
  with check (public.has_permission('editLibrary'));

-- =====================================================================
-- products — قراءة عامة (المتجر)، تعديل الأسعار للمدير فقط
-- =====================================================================
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to authenticated using (true);

drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- settings — قراءة عامة (رسالة المدير)، تعديل للمدير فقط
-- =====================================================================
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated using (true);

drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- finance — للمدير فقط (لا تصله أي صفحة أخرى بالواجهة أصلاً)
-- =====================================================================
drop policy if exists finance_all on public.finance;
create policy finance_all on public.finance for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- بعد هذا الملف: شغّل supabase/03_finalize.sql لحذف عمودي
-- password وmedical نهائيًا من جدول users.
-- =====================================================================
