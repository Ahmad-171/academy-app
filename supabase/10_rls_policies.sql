-- ══════════════════════════════════════════════════════════════
-- الخطوة 3: تفعيل RLS وسياسات الوصول لكل الجداول.
-- شغّل هذا بعد نجاح سكربت الترحيل (كل الحسابات صار لها auth_uid).
-- كل السياسات تتطلب مستخدمًا مسجّل دخوله؛ الزائر بلا حساب لا يصل لشيء.
-- ══════════════════════════════════════════════════════════════

-- ── users ──
-- القراءة: أي مستخدم مسجّل (التطبيق يحتاج قوائم الأسماء/الأدوار؛ عمود
-- كلمة السر يُحذف نهائيًا في الملف 11 فلا تسريب لبيانات الدخول).
alter table users enable row level security;
drop policy if exists users_select on users;
drop policy if exists users_insert on users;
drop policy if exists users_update on users;
drop policy if exists users_delete on users;
create policy users_select on users for select to authenticated using (true);
create policy users_insert on users for insert to authenticated with check (is_admin() or has_perm('editData'));
create policy users_update on users for update to authenticated
  using (is_admin() or has_perm('editData') or has_perm('editRatings') or auth_uid = auth.uid());
create policy users_delete on users for delete to authenticated using (is_admin());

-- ── schedule ──
alter table schedule enable row level security;
drop policy if exists schedule_all on schedule;
drop policy if exists schedule_select on schedule;
drop policy if exists schedule_write on schedule;
create policy schedule_select on schedule for select to authenticated using (true);
create policy schedule_write on schedule for all to authenticated
  using (is_admin() or has_perm('editSchedule')) with check (is_admin() or has_perm('editSchedule'));

-- ── notifications (الفعاليات والرسائل) ──
-- القراءة والتعليم كمقروء متاحة للمسجّلين؛ الإنشاء/الحذف للمدير أو صاحب صلاحية الإرسال.
alter table notifications enable row level security;
drop policy if exists notifications_select on notifications;
drop policy if exists notifications_update on notifications;
drop policy if exists notifications_insert on notifications;
drop policy if exists notifications_delete on notifications;
create policy notifications_select on notifications for select to authenticated using (true);
create policy notifications_update on notifications for update to authenticated using (true) with check (true);
create policy notifications_insert on notifications for insert to authenticated with check (is_admin() or has_perm('sendNotifications'));
create policy notifications_delete on notifications for delete to authenticated using (is_admin() or has_perm('sendNotifications'));

-- ── library (معرض الصور) ──
alter table library enable row level security;
drop policy if exists library_select on library;
drop policy if exists library_write on library;
create policy library_select on library for select to authenticated using (true);
create policy library_write on library for all to authenticated
  using (is_admin() or has_perm('editLibrary')) with check (is_admin() or has_perm('editLibrary'));

-- ── products (المتجر) ──
alter table products enable row level security;
drop policy if exists products_select on products;
drop policy if exists products_write on products;
create policy products_select on products for select to authenticated using (true);
create policy products_write on products for all to authenticated
  using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'));

-- ── settings (إعدادات عامة + باركود الحضور اليومي) ──
-- القراءة للجميع (اللاعبون يقرؤون توكن الحضور)، والكتابة للمدير أو أصحاب صلاحيات المحتوى.
alter table settings enable row level security;
drop policy if exists settings_select on settings;
drop policy if exists settings_write on settings;
create policy settings_select on settings for select to authenticated using (true);
create policy settings_write on settings for all to authenticated
  using (is_admin() or has_perm('editCommerce') or has_perm('editSchedule'))
  with check (is_admin() or has_perm('editCommerce') or has_perm('editSchedule'));

-- ── finance (حساس: القراءة والكتابة للمدير/صلاحية التجارة فقط) ──
alter table finance enable row level security;
drop policy if exists finance_all on finance;
create policy finance_all on finance for all to authenticated
  using (is_admin() or has_perm('editCommerce')) with check (is_admin() or has_perm('editCommerce'));

-- ── attendance_log (الحضور والانصراف) ──
-- القراءة: المدير/صلاحية الجدول/التقييم، أو اللاعب لسجله، أو ولي الأمر لسجل ابنه.
-- الكتابة: المدير/صلاحية الجدول، أو اللاعب لسجله هو (المسح الذاتي للباركود).
alter table attendance_log enable row level security;
drop policy if exists attendance_select on attendance_log;
drop policy if exists attendance_write on attendance_log;
drop policy if exists attendance_update on attendance_log;
drop policy if exists attendance_delete on attendance_log;
create policy attendance_select on attendance_log for select to authenticated
  using (is_admin() or has_perm('editSchedule') or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id());
create policy attendance_write on attendance_log for insert to authenticated
  with check (is_admin() or has_perm('editSchedule') or user_id = my_id());
create policy attendance_update on attendance_log for update to authenticated
  using (is_admin() or has_perm('editSchedule') or user_id = my_id())
  with check (is_admin() or has_perm('editSchedule') or user_id = my_id());
create policy attendance_delete on attendance_log for delete to authenticated
  using (is_admin() or has_perm('editSchedule'));

-- ── evaluations (التقييمات) ──
alter table evaluations enable row level security;
drop policy if exists evaluations_select on evaluations;
drop policy if exists evaluations_write on evaluations;
create policy evaluations_select on evaluations for select to authenticated
  using (is_admin() or has_perm('editRatings') or user_id = my_id() or user_id = my_child_id());
create policy evaluations_write on evaluations for all to authenticated
  using (is_admin() or has_perm('editRatings')) with check (is_admin() or has_perm('editRatings'));

-- ── player_notes (ملاحظات المدربين) ──
alter table player_notes enable row level security;
drop policy if exists player_notes_select on player_notes;
drop policy if exists player_notes_write on player_notes;
create policy player_notes_select on player_notes for select to authenticated
  using (is_admin() or has_perm('editData') or user_id = my_id() or user_id = my_child_id());
create policy player_notes_write on player_notes for all to authenticated
  using (is_admin() or has_perm('editData')) with check (is_admin() or has_perm('editData'));

-- ── discount_codes (أكواد الخصم) ──
-- القراءة للجميع (للتحقق عند الشراء)، وتحديث عدّاد الاستخدام متاح للمسجّلين،
-- والإنشاء/الحذف للمدير أو صلاحية التجارة.
alter table discount_codes enable row level security;
drop policy if exists discount_select on discount_codes;
drop policy if exists discount_update on discount_codes;
drop policy if exists discount_insert on discount_codes;
drop policy if exists discount_delete on discount_codes;
create policy discount_select on discount_codes for select to authenticated using (true);
create policy discount_update on discount_codes for update to authenticated using (true) with check (true);
create policy discount_insert on discount_codes for insert to authenticated with check (is_admin() or has_perm('editCommerce'));
create policy discount_delete on discount_codes for delete to authenticated using (is_admin() or has_perm('editCommerce'));

-- ── subscription_payments ──
alter table subscription_payments enable row level security;
drop policy if exists subpay_select on subscription_payments;
drop policy if exists subpay_insert on subscription_payments;
create policy subpay_select on subscription_payments for select to authenticated
  using (is_admin() or has_perm('editCommerce') or user_id = my_id());
create policy subpay_insert on subscription_payments for insert to authenticated
  with check (is_admin() or user_id = my_id());

-- ── store_orders ──
alter table store_orders enable row level security;
drop policy if exists orders_select on store_orders;
drop policy if exists orders_insert on store_orders;
create policy orders_select on store_orders for select to authenticated
  using (is_admin() or has_perm('editCommerce') or user_id = my_id());
create policy orders_insert on store_orders for insert to authenticated
  with check (is_admin() or user_id = my_id());
