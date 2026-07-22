-- ══════════════════════════════════════════════════════════════
-- طلبات الاشتراك: بعد اختيار اللاعب لاشتراك تُنشأ «طلب» بحالة pending
-- يظهر لحساب المدير/صاحب صلاحية الاشتراكات ليفعّله أو يرفضه.
-- عند التفعيل يُحدَّث تاريخ بداية/انتهاء الاشتراك في حساب اللاعب.
--
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- ══════════════════════════════════════════════════════════════

alter table public.subscription_payments add column if not exists method text default 'cash';
alter table public.subscription_payments add column if not exists status text not null default 'pending';
alter table public.subscription_payments add column if not exists decided_at timestamptz;

-- السماح للمدير/صاحب صلاحية الاشتراكات بتفعيل أو رفض الطلبات
drop policy if exists subpay_update on public.subscription_payments;
create policy subpay_update on public.subscription_payments for update to authenticated
  using (is_admin() or has_perm('editCommerce'))
  with check (is_admin() or has_perm('editCommerce'));
