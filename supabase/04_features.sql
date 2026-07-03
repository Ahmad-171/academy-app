-- =====================================================================
-- أكاديمية النجوم — الخطوة ٥: جداول الميزات (نقاط، اشتراكات، متجر، مكتبة)
-- =====================================================================
-- شغّل هذا الملف بعد supabase/02_enable_rls.sql (يستخدم نفس الدوال
-- المساعدة is_admin() و current_user_id()).
-- =====================================================================

-- استبدال نقاط المكافآت
create table if not exists public.redemptions (
  id           bigint generated always as identity primary key,
  user_id      text references public.users(id) on delete cascade,
  reward_name  text not null,
  points       integer not null,
  redeemed_at  timestamptz not null default now()
);

alter table public.redemptions enable row level security;

drop policy if exists redemptions_select on public.redemptions;
create policy redemptions_select on public.redemptions for select
  to authenticated
  using (public.is_admin() or user_id = public.current_user_id());

drop policy if exists redemptions_insert on public.redemptions;
create policy redemptions_insert on public.redemptions for insert
  to authenticated
  with check (user_id = public.current_user_id());

-- الاشتراكات
create table if not exists public.subscriptions (
  id               bigint generated always as identity primary key,
  user_id          text references public.users(id) on delete cascade,
  plan             text not null,
  price            text,
  payment_method   text,
  created_at       timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select
  to authenticated
  using (public.is_admin() or user_id = public.current_user_id());

drop policy if exists subscriptions_insert on public.subscriptions;
create policy subscriptions_insert on public.subscriptions for insert
  to authenticated
  with check (user_id = public.current_user_id());

-- طلبات المتجر
create table if not exists public.orders (
  id          bigint generated always as identity primary key,
  user_id     text references public.users(id) on delete cascade,
  total       numeric not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint references public.orders(id) on delete cascade,
  product_id    bigint,
  product_name  text not null,
  price         numeric not null
);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select
  to authenticated
  using (public.is_admin() or user_id = public.current_user_id());

drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert
  to authenticated
  with check (user_id = public.current_user_id());

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or order_id in (select id from public.orders where user_id = public.current_user_id())
  );

drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items for insert
  to authenticated
  with check (
    order_id in (select id from public.orders where user_id = public.current_user_id())
  );

-- رفع وسائط حقيقية للمكتبة
alter table public.library add column if not exists media_url text;

insert into storage.buckets (id, name, public)
values ('library-media', 'library-media', true)
on conflict (id) do nothing;

drop policy if exists library_media_public_read on storage.objects;
create policy library_media_public_read on storage.objects for select
  using (bucket_id = 'library-media');

drop policy if exists library_media_authenticated_write on storage.objects;
create policy library_media_authenticated_write on storage.objects for insert
  to authenticated
  with check (bucket_id = 'library-media' and public.has_permission('editLibrary'));

drop policy if exists library_media_authenticated_delete on storage.objects;
create policy library_media_authenticated_delete on storage.objects for delete
  to authenticated
  using (bucket_id = 'library-media' and public.has_permission('editLibrary'));
