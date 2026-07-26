-- ══════════════════════════════════════════════════════════════
-- طلبات العضوية: بعد اختيار اللاعب لعضوية تُنشأ «طلب» بحالة pending
-- يظهر لحساب المدير/صاحب صلاحية الاشتراكات ليفعّله أو يرفضه
-- (نفس نظام طلبات الاشتراك، مع طريقة الدفع كاش/تحويل).
--
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- ══════════════════════════════════════════════════════════════

create table if not exists public.membership_requests (
  id bigint generated always as identity primary key,
  user_id text not null,
  membership_name text not null,
  amount numeric not null default 0,
  method text default 'cash',
  status text not null default 'pending',
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.membership_requests enable row level security;

drop policy if exists memreq_select on public.membership_requests;
create policy memreq_select on public.membership_requests for select to authenticated
  using (is_admin() or has_perm('editCommerce') or user_id = my_id());

drop policy if exists memreq_insert on public.membership_requests;
create policy memreq_insert on public.membership_requests for insert to authenticated
  with check (is_admin() or user_id = my_id());

drop policy if exists memreq_update on public.membership_requests;
create policy memreq_update on public.membership_requests for update to authenticated
  using (is_admin() or has_perm('editCommerce'))
  with check (is_admin() or has_perm('editCommerce'));

-- حذف طلبات العضوية تلقائيًا عند حذف الحساب
create or replace function cleanup_user_on_delete() returns trigger as $$
begin
  delete from public.attendance_log where user_id = old.id;
  delete from public.evaluations where user_id = old.id;
  delete from public.player_notes where user_id = old.id;
  delete from public.subscription_payments where user_id = old.id;
  delete from public.membership_requests where user_id = old.id;
  delete from public.store_orders where user_id = old.id;
  if old.auth_uid is not null then delete from auth.users where id = old.auth_uid; end if;
  return old;
end; $$ language plpgsql security definer;
