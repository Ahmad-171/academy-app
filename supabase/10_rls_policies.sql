-- ══════════════════════════════════════════════════════════════
-- الخطوة 3: تفعيل RLS وسياسات الوصول لكل الجداول.
-- شغّل هذا بعد نجاح ترحيل الحسابات (09b). كل السياسات تتطلب مستخدمًا
-- مسجّل دخوله؛ الزائر بلا حساب لا يصل لشيء.
-- الملف «مضاد للأخطاء»: أي جدول غير موجود يُتجاوَز بدل أن يفشل السكربت.
-- ══════════════════════════════════════════════════════════════

do $rls$
begin
  -- ── users ──
  -- القراءة لأي مسجّل (التطبيق يحتاج قوائم الأسماء/الأدوار؛ عمود كلمة السر
  -- يُحذف في الملف 11 فلا تسريب لبيانات الدخول).
  if to_regclass('public.users') is not null then
    execute 'alter table public.users enable row level security';
    execute 'drop policy if exists users_select on public.users';
    execute 'drop policy if exists users_insert on public.users';
    execute 'drop policy if exists users_update on public.users';
    execute 'drop policy if exists users_delete on public.users';
    execute $p$create policy users_select on public.users for select to authenticated using (true)$p$;
    execute $p$create policy users_insert on public.users for insert to authenticated with check (is_admin() or has_perm('editData'))$p$;
    execute $p$create policy users_update on public.users for update to authenticated using (is_admin() or has_perm('editData') or has_perm('editRatings') or auth_uid = auth.uid())$p$;
    execute $p$create policy users_delete on public.users for delete to authenticated using (is_admin())$p$;
  end if;

  -- ── schedule ──
  if to_regclass('public.schedule') is not null then
    execute 'alter table public.schedule enable row level security';
    execute 'drop policy if exists schedule_select on public.schedule';
    execute 'drop policy if exists schedule_write on public.schedule';
    execute $p$create policy schedule_select on public.schedule for select to authenticated using (true)$p$;
    execute $p$create policy schedule_write on public.schedule for all to authenticated using (is_admin() or has_perm('editSchedule')) with check (is_admin() or has_perm('editSchedule'))$p$;
  end if;

  -- ── notifications (الفعاليات والرسائل) ──
  if to_regclass('public.notifications') is not null then
    execute 'alter table public.notifications enable row level security';
    execute 'drop policy if exists notifications_select on public.notifications';
    execute 'drop policy if exists notifications_update on public.notifications';
    execute 'drop policy if exists notifications_insert on public.notifications';
    execute 'drop policy if exists notifications_delete on public.notifications';
    execute $p$create policy notifications_select on public.notifications for select to authenticated using (true)$p$;
    execute $p$create policy notifications_update on public.notifications for update to authenticated using (true) with check (true)$p$;
    execute $p$create policy notifications_insert on public.notifications for insert to authenticated with check (is_admin() or has_perm('sendNotifications'))$p$;
    execute $p$create policy notifications_delete on public.notifications for delete to authenticated using (is_admin() or has_perm('sendNotifications'))$p$;
  end if;

  -- ── library (معرض الصور) ──
  if to_regclass('public.library') is not null then
    execute 'alter table public.library enable row level security';
    execute 'drop policy if exists library_select on public.library';
    execute 'drop policy if exists library_write on public.library';
    execute $p$create policy library_select on public.library for select to authenticated using (true)$p$;
    execute $p$create policy library_write on public.library for all to authenticated using (is_admin() or has_perm('editLibrary')) with check (is_admin() or has_perm('editLibrary'))$p$;
  end if;

  -- ── products (المتجر) ──
  if to_regclass('public.products') is not null then
    execute 'alter table public.products enable row level security';
    execute 'drop policy if exists products_select on public.products';
    execute 'drop policy if exists products_write on public.products';
    execute $p$create policy products_select on public.products for select to authenticated using (true)$p$;
    execute $p$create policy products_write on public.products for all to authenticated using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'))$p$;
  end if;

  -- ── settings (إعدادات + باركود الحضور اليومي) ──
  if to_regclass('public.settings') is not null then
    execute 'alter table public.settings enable row level security';
    execute 'drop policy if exists settings_select on public.settings';
    execute 'drop policy if exists settings_write on public.settings';
    execute $p$create policy settings_select on public.settings for select to authenticated using (true)$p$;
    execute $p$create policy settings_write on public.settings for all to authenticated using (is_admin() or has_perm('editCommerce') or has_perm('editSchedule')) with check (is_admin() or has_perm('editCommerce') or has_perm('editSchedule'))$p$;
  end if;

  -- ── finance (حساس: للمدير/صلاحية التجارة فقط) ──
  if to_regclass('public.finance') is not null then
    execute 'alter table public.finance enable row level security';
    execute 'drop policy if exists finance_all on public.finance';
    execute $p$create policy finance_all on public.finance for all to authenticated using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'))$p$;
  end if;

  -- ── attendance_log (الحضور والانصراف) ──
  if to_regclass('public.attendance_log') is not null then
    execute 'alter table public.attendance_log enable row level security';
    execute 'drop policy if exists attendance_select on public.attendance_log';
    execute 'drop policy if exists attendance_write on public.attendance_log';
    execute 'drop policy if exists attendance_update on public.attendance_log';
    execute 'drop policy if exists attendance_delete on public.attendance_log';
    execute $p$create policy attendance_select on public.attendance_log for select to authenticated using (is_admin() or has_perm('editSchedule') or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id())$p$;
    execute $p$create policy attendance_write on public.attendance_log for insert to authenticated with check (is_admin() or has_perm('editSchedule') or user_id = my_id())$p$;
    execute $p$create policy attendance_update on public.attendance_log for update to authenticated using (is_admin() or has_perm('editSchedule') or user_id = my_id()) with check (is_admin() or has_perm('editSchedule') or user_id = my_id())$p$;
    execute $p$create policy attendance_delete on public.attendance_log for delete to authenticated using (is_admin() or has_perm('editSchedule'))$p$;
  end if;

  -- ── evaluations (التقييمات) ──
  if to_regclass('public.evaluations') is not null then
    execute 'alter table public.evaluations enable row level security';
    execute 'drop policy if exists evaluations_select on public.evaluations';
    execute 'drop policy if exists evaluations_write on public.evaluations';
    execute $p$create policy evaluations_select on public.evaluations for select to authenticated using (is_admin() or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id())$p$;
    execute $p$create policy evaluations_write on public.evaluations for all to authenticated using (is_admin() or has_perm('editRatings')) with check (is_admin() or has_perm('editRatings'))$p$;
  end if;

  -- ── player_notes (ملاحظات المدربين) ──
  if to_regclass('public.player_notes') is not null then
    execute 'alter table public.player_notes enable row level security';
    execute 'drop policy if exists player_notes_select on public.player_notes';
    execute 'drop policy if exists player_notes_write on public.player_notes';
    execute $p$create policy player_notes_select on public.player_notes for select to authenticated using (is_admin() or has_perm('editData') or user_id = my_id() or user_id = my_child_id())$p$;
    execute $p$create policy player_notes_write on public.player_notes for all to authenticated using (is_admin() or has_perm('editData')) with check (is_admin() or has_perm('editData'))$p$;
  end if;

  -- ── discount_codes (أكواد الخصم) ──
  if to_regclass('public.discount_codes') is not null then
    execute 'alter table public.discount_codes enable row level security';
    execute 'drop policy if exists discount_select on public.discount_codes';
    execute 'drop policy if exists discount_update on public.discount_codes';
    execute 'drop policy if exists discount_insert on public.discount_codes';
    execute 'drop policy if exists discount_delete on public.discount_codes';
    execute $p$create policy discount_select on public.discount_codes for select to authenticated using (true)$p$;
    execute $p$create policy discount_update on public.discount_codes for update to authenticated using (true) with check (true)$p$;
    execute $p$create policy discount_insert on public.discount_codes for insert to authenticated with check (is_admin() or has_perm('editCommerce'))$p$;
    execute $p$create policy discount_delete on public.discount_codes for delete to authenticated using (is_admin() or has_perm('editCommerce'))$p$;
  end if;

  -- ── subscription_payments ──
  if to_regclass('public.subscription_payments') is not null then
    execute 'alter table public.subscription_payments enable row level security';
    execute 'drop policy if exists subpay_select on public.subscription_payments';
    execute 'drop policy if exists subpay_insert on public.subscription_payments';
    execute $p$create policy subpay_select on public.subscription_payments for select to authenticated using (is_admin() or has_perm('editCommerce') or user_id = my_id())$p$;
    execute $p$create policy subpay_insert on public.subscription_payments for insert to authenticated with check (is_admin() or user_id = my_id())$p$;
  end if;

  -- ── store_orders ──
  if to_regclass('public.store_orders') is not null then
    execute 'alter table public.store_orders enable row level security';
    execute 'drop policy if exists orders_select on public.store_orders';
    execute 'drop policy if exists orders_insert on public.store_orders';
    execute $p$create policy orders_select on public.store_orders for select to authenticated using (is_admin() or has_perm('editCommerce') or user_id = my_id())$p$;
    execute $p$create policy orders_insert on public.store_orders for insert to authenticated with check (is_admin() or user_id = my_id())$p$;
  end if;
end $rls$;
