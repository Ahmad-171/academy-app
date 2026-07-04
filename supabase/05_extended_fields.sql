-- =====================================================================
-- NZ Academy — حقول وجداول الميزات الجديدة (فرع demo-preview)
-- =====================================================================
-- هذا الفرع بدون RLS/Auth (عرض تجريبي سريع) — الجداول هنا عامة الوصول
-- بنفس نمط الجداول الحالية. شغّل هذا الملف مرة واحدة من Supabase
-- SQL Editor قبل استخدام الميزات الجديدة (تسجيل اللاعبين الموسّع،
-- الحضور والانصراف، التقييمات بالتاريخ، الملاحظات، أكواد الخصم).
-- =====================================================================

-- حقول تسجيل اللاعبين الموسّعة + بوابة توقيع العقد
alter table public.users add column if not exists birth_date text;
alter table public.users add column if not exists parent_name text;
alter table public.users add column if not exists parent_phone text;
alter table public.users add column if not exists subscription_start text;
alter table public.users add column if not exists subscription_end text;
alter table public.users add column if not exists membership_number text;
alter table public.users add column if not exists category text;
alter table public.users add column if not exists contract_signed boolean default false;
alter table public.users add column if not exists contract_signed_at timestamptz;

-- الحضور والانصراف: سجل حقيقي بالتاريخ والوقت (وليس فقط ✅/❌)
create table if not exists public.attendance_log (
  id          bigint generated always as identity primary key,
  user_id     text not null,
  day         date not null default current_date,
  check_in    timestamptz,
  check_out   timestamptz
);
create unique index if not exists attendance_log_user_day_idx on public.attendance_log(user_id, day);

-- التقييمات مع التاريخ والملاحظات (سجل تاريخي وليس رقم واحد يُستبدل)
create table if not exists public.evaluations (
  id          bigint generated always as identity primary key,
  user_id     text not null,
  eval_date   date not null default current_date,
  ratings     jsonb not null default '{}'::jsonb,
  note        text,
  created_at  timestamptz not null default now()
);

-- ملاحظات اللاعبين (اسم اللاعب + الملاحظة)
create table if not exists public.player_notes (
  id          bigint generated always as identity primary key,
  user_id     text not null,
  note        text not null,
  created_at  timestamptz not null default now()
);

-- أكواد الخصم (اشتراكات ومتجر)
create table if not exists public.discount_codes (
  code         text primary key,
  percent_off  numeric not null default 0,
  active       boolean not null default true
);

-- سجل مدفوعات الاشتراكات
create table if not exists public.subscription_payments (
  id             bigint generated always as identity primary key,
  user_id        text not null,
  plan_label     text not null,
  months         integer not null,
  amount         numeric not null,
  discount_code  text,
  created_at     timestamptz not null default now()
);

-- طلبات المتجر (مع المقاس وكود الخصم)
create table if not exists public.store_orders (
  id             bigint generated always as identity primary key,
  user_id        text not null,
  product_name   text not null,
  size           text,
  amount         numeric not null,
  discount_code  text,
  created_at     timestamptz not null default now()
);

-- كود خصم تجريبي جاهز للاختبار
insert into public.discount_codes (code, percent_off, active)
values ('WELCOME10', 10, true)
on conflict (code) do nothing;

-- منتج طقم الأكاديمية (يُضاف فقط إذا ما كان موجود بنفس الاسم)
insert into public.products (name, price, category, img, images)
select 'طقم الأكاديمية', 80, 'ملابس', '👕', '[]'::jsonb
where not exists (select 1 from public.products where name = 'طقم الأكاديمية');
