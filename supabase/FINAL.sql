-- ════════════════════════════════════════════════════════════════════
-- NZ Academy — السكربت النهائي الموحّد (شغّله وحده يكفي)
-- ⚠️ يمسح كل البيانات الحالية (بما فيها الحسابات الخاطئة @111 ...) ويعيد
--    بناء كل شيء صحيحًا: الجداول + الحماية + الحسابات الأربعة الصحيحة.
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- الحسابات بعده (كلها مخفية، تظهر لحساب المبرمج 111 فقط):
--   111 حساب مبرمج (مبرمج) | 222 مدرب مبرمج (مدرب)
--   333 لاعب مبرمج (لاعب، مدربه 222) | 444 ولي امر مبرمج (ابنه 333)
-- كلمة سر كل حساب = نفس رقمه.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 0) حذف كل الجداول القديمة ──
drop table if exists public.tournament_scorers    cascade;
drop table if exists public.tournament_teams      cascade;
drop table if exists public.schedule              cascade;
drop table if exists public.attendance_log        cascade;
drop table if exists public.evaluations           cascade;
drop table if exists public.player_notes          cascade;
drop table if exists public.discount_codes        cascade;
drop table if exists public.subscription_payments cascade;
drop table if exists public.store_orders          cascade;
drop table if exists public.finance               cascade;
drop table if exists public.notifications         cascade;
drop table if exists public.library               cascade;
drop table if exists public.products              cascade;
drop table if exists public.settings              cascade;
drop table if exists public.users                 cascade;

-- امسح أي حسابات مصادقة قديمة (بما فيها الخاطئة @...)
delete from auth.users where email like '%@academy.local';

-- ── 1) الجداول ──
create table public.users (
  id text primary key,
  auth_uid uuid references auth.users(id) on delete set null,
  role text not null default 'لاعب', custom_role text, name text not null, phone text,
  membership text default '-', status text default 'نشط', position text default '-',
  points integer default 0, attendance integer default 0, child_id text, coach_id text,
  permissions jsonb default '{}'::jsonb, medical jsonb default '{}'::jsonb, ratings jsonb default '{}'::jsonb,
  birth_date text, parent_name text, parent_phone text, subscription_start text, subscription_end text,
  membership_number text, category text, contract_signed boolean default false, contract_signed_at timestamptz,
  hidden boolean default false, is_demo boolean default false
);
create index users_auth_uid_idx on public.users(auth_uid);
create table public.products (id bigint generated always as identity primary key, name text not null, price numeric default 0, category text, img text, images jsonb default '[]'::jsonb);
create table public.settings (key text primary key, value text);
create table public.finance (id bigint generated always as identity primary key, type text not null, label text not null, amount numeric default 0, date text, note text, created_at timestamptz default now());
create table public.notifications (id bigint generated always as identity primary key, type text, msg text not null, time text, read boolean default false, roles jsonb default '[]'::jsonb, sender text, show_on_home boolean default false, created_at timestamptz default now());
create table public.library (id bigint generated always as identity primary key, type text, category text, title text, emoji text, date text, added_by text, media_url text);
create table public.attendance_log (id bigint generated always as identity primary key, user_id text not null, day date not null default current_date, check_in timestamptz, check_out timestamptz);
create unique index attendance_log_user_day_idx on public.attendance_log(user_id, day);
create table public.evaluations (id bigint generated always as identity primary key, user_id text not null, eval_date date not null default current_date, ratings jsonb not null default '{}'::jsonb, note text, created_at timestamptz not null default now());
create table public.player_notes (id bigint generated always as identity primary key, user_id text not null, note text not null, created_at timestamptz not null default now());
create table public.discount_codes (code text primary key, percent_off numeric not null default 0, active boolean not null default true, max_uses integer, used_count integer not null default 0);
create table public.subscription_payments (id bigint generated always as identity primary key, user_id text not null, plan_label text not null, months integer not null, amount numeric not null, discount_code text, created_at timestamptz not null default now());
create table public.store_orders (id bigint generated always as identity primary key, user_id text not null, product_name text not null, size text, amount numeric not null, discount_code text, created_at timestamptz not null default now());

-- ── 2) دوال الصلاحيات («مبرمج» مثل «مدير») ──
create or replace function is_admin() returns boolean as $$ select coalesce((select role in ('مدير','مبرمج') from public.users where auth_uid = auth.uid() limit 1), false); $$ language sql security definer stable;
create or replace function has_perm(p text) returns boolean as $$ select coalesce((select role in ('مدير','مبرمج') or coalesce((permissions->>p)::boolean, false) from public.users where auth_uid = auth.uid() limit 1), false); $$ language sql security definer stable;
create or replace function my_id() returns text as $$ select id from public.users where auth_uid = auth.uid() limit 1; $$ language sql security definer stable;
create or replace function my_child_id() returns text as $$ select child_id from public.users where auth_uid = auth.uid() limit 1; $$ language sql security definer stable;

-- ── حذف تلقائي كامل عند حذف أي حساب ──
create or replace function cleanup_user_on_delete() returns trigger as $$
begin
  delete from public.attendance_log where user_id = old.id;
  delete from public.evaluations where user_id = old.id;
  delete from public.player_notes where user_id = old.id;
  delete from public.subscription_payments where user_id = old.id;
  delete from public.store_orders where user_id = old.id;
  if old.auth_uid is not null then delete from auth.users where id = old.auth_uid; end if;
  return old;
end; $$ language plpgsql security definer;
drop trigger if exists trg_cleanup_user_on_delete on public.users;
create trigger trg_cleanup_user_on_delete after delete on public.users for each row execute function cleanup_user_on_delete();

-- ── 3) تفعيل RLS + السياسات ──
alter table public.users enable row level security;
create policy users_select on public.users for select to authenticated using (true);
create policy users_insert on public.users for insert to authenticated with check (is_admin() or has_perm('editData'));
create policy users_update on public.users for update to authenticated using (is_admin() or has_perm('editData') or has_perm('editRatings') or auth_uid = auth.uid());
create policy users_delete on public.users for delete to authenticated using (is_admin());
alter table public.products enable row level security;
create policy products_select on public.products for select to authenticated using (true);
create policy products_write on public.products for all to authenticated using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'));
alter table public.settings enable row level security;
create policy settings_select on public.settings for select to authenticated using (true);
create policy settings_write on public.settings for all to authenticated using (is_admin() or has_perm('editCommerce') or has_perm('editSchedule')) with check (is_admin() or has_perm('editCommerce') or has_perm('editSchedule'));
alter table public.finance enable row level security;
create policy finance_all on public.finance for all to authenticated using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'));
alter table public.notifications enable row level security;
create policy notifications_select on public.notifications for select to authenticated using (true);
create policy notifications_update on public.notifications for update to authenticated using (true) with check (true);
create policy notifications_insert on public.notifications for insert to authenticated with check (is_admin() or has_perm('sendNotifications'));
create policy notifications_delete on public.notifications for delete to authenticated using (is_admin() or has_perm('sendNotifications'));
alter table public.library enable row level security;
create policy library_select on public.library for select to authenticated using (true);
create policy library_write on public.library for all to authenticated using (is_admin() or has_perm('editLibrary')) with check (is_admin() or has_perm('editLibrary'));
alter table public.attendance_log enable row level security;
create policy attendance_select on public.attendance_log for select to authenticated using (is_admin() or has_perm('editSchedule') or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id());
create policy attendance_insert on public.attendance_log for insert to authenticated with check (is_admin() or has_perm('editSchedule') or user_id = my_id());
create policy attendance_update on public.attendance_log for update to authenticated using (is_admin() or has_perm('editSchedule') or user_id = my_id()) with check (is_admin() or has_perm('editSchedule') or user_id = my_id());
create policy attendance_delete on public.attendance_log for delete to authenticated using (is_admin() or has_perm('editSchedule'));
alter table public.evaluations enable row level security;
create policy evaluations_select on public.evaluations for select to authenticated using (is_admin() or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id());
create policy evaluations_write on public.evaluations for all to authenticated using (is_admin() or has_perm('editRatings')) with check (is_admin() or has_perm('editRatings'));
alter table public.player_notes enable row level security;
create policy player_notes_select on public.player_notes for select to authenticated using (is_admin() or has_perm('editData') or user_id = my_id() or user_id = my_child_id());
create policy player_notes_write on public.player_notes for all to authenticated using (is_admin() or has_perm('editData')) with check (is_admin() or has_perm('editData'));
alter table public.discount_codes enable row level security;
create policy discount_select on public.discount_codes for select to authenticated using (true);
create policy discount_update on public.discount_codes for update to authenticated using (true) with check (true);
create policy discount_insert on public.discount_codes for insert to authenticated with check (is_admin() or has_perm('editCommerce'));
create policy discount_delete on public.discount_codes for delete to authenticated using (is_admin() or has_perm('editCommerce'));
alter table public.subscription_payments enable row level security;
create policy subpay_select on public.subscription_payments for select to authenticated using (is_admin() or has_perm('editCommerce') or user_id = my_id());
create policy subpay_insert on public.subscription_payments for insert to authenticated with check (is_admin() or user_id = my_id());
alter table public.store_orders enable row level security;
create policy orders_select on public.store_orders for select to authenticated using (is_admin() or has_perm('editCommerce') or user_id = my_id());
create policy orders_insert on public.store_orders for insert to authenticated with check (is_admin() or user_id = my_id());

-- ── 4) التخزين ──
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists media_read on storage.objects;
drop policy if exists media_write on storage.objects;
drop policy if exists media_delete on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
create policy media_write on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy media_delete on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ── 5) بيانات ابتدائية ──
insert into public.discount_codes (code, percent_off, active) values ('WELCOME10', 10, true) on conflict (code) do nothing;
insert into public.products (name, price, category, img, images) values ('طقم الأكاديمية', 280, 'ملابس', '👕', '[]'::jsonb);
insert into public.settings (key, value) values ('director_message', 'نؤمن بأن كل موهبة تستحق الرعاية والتطوير. مرحبًا بكم في أكاديميتنا.') on conflict (key) do nothing;

-- ── 6) الحسابات الأربعة الصحيحة (كلها مخفية) ──
create or replace function create_academy_account(
  p_id text, p_pass text, p_name text, p_role text,
  p_hidden boolean default false, p_child text default null, p_coach text default null
) returns void as $$
declare v_email text; v_uid uuid;
begin
  v_email := lower(trim(p_id)) || '@academy.local';
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change)
    values ('00000000-0000-0000-0000-000000000000',v_uid,'authenticated','authenticated',v_email,crypt(p_pass,gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,'','','','');
    insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (v_uid::text,v_uid,jsonb_build_object('sub',v_uid::text,'email',v_email,'email_verified',true),'email',now(),now(),now());
  else
    update auth.users set encrypted_password=crypt(p_pass,gen_salt('bf')), email_confirmed_at=coalesce(email_confirmed_at,now()) where id=v_uid;
  end if;
  insert into public.users (id,auth_uid,name,role,custom_role,status,permissions,points,attendance,hidden,child_id,coach_id)
  values (p_id,v_uid,p_name,p_role,p_role,'نشط','{}'::jsonb,0,0,p_hidden,p_child,p_coach)
  on conflict (id) do update set auth_uid=excluded.auth_uid, name=excluded.name, role=excluded.role,
    custom_role=excluded.custom_role, hidden=excluded.hidden, child_id=excluded.child_id, coach_id=excluded.coach_id;
end;
$$ language plpgsql;

select create_academy_account('111','111','حساب مبرمج',   'مبرمج',   true);
select create_academy_account('222','222','مدرب مبرمج',   'مدرب',    true);
select create_academy_account('333','333','لاعب مبرمج',   'لاعب',    true, null, '222');
select create_academy_account('444','444','ولي امر مبرمج','ولي أمر', true, '333', null);
