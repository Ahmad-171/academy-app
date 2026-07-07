-- ⚠️ حذف نهائي: يحذف كل الحسابات ويُبقي حساب 111 فقط. لا يمكن التراجع.
-- شغّله في Supabase → SQL Editor.

-- 1) احذف بيانات المستخدمين المرتبطة (ما عدا 111) إن وُجدت الجداول
do $$
begin
  if to_regclass('public.attendance_log')       is not null then delete from public.attendance_log       where user_id <> '111'; end if;
  if to_regclass('public.evaluations')          is not null then delete from public.evaluations          where user_id <> '111'; end if;
  if to_regclass('public.player_notes')         is not null then delete from public.player_notes         where user_id <> '111'; end if;
  if to_regclass('public.subscription_payments') is not null then delete from public.subscription_payments where user_id <> '111'; end if;
  if to_regclass('public.store_orders')         is not null then delete from public.store_orders         where user_id <> '111'; end if;
end $$;

-- 2) احذف كل صفوف المستخدمين ما عدا 111
delete from public.users where id <> '111';

-- 3) احذف كل حسابات المصادقة ما عدا حساب 111
delete from auth.users where email <> '111@academy.local';

-- 4) تأكد أن 111 مدير وظاهر ونشط
update public.users set role = 'مدير', status = 'نشط', hidden = false, is_demo = false where id = '111';
