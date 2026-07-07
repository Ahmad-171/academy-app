-- ══════════════════════════════════════════════════════════════
-- حذف كامل عند حذف الحساب: يحذف حساب المصادقة وكل البيانات المرتبطة،
-- حتى يمكن إعادة إضافة حساب بنفس رقم الهوية.
-- شغّله مرة واحدة على قاعدة بياناتك الحالية (غير مطلوب إن شغّلت SETUP.sql).
-- ══════════════════════════════════════════════════════════════

-- 1) دالة + مُشغّل التنظيف التلقائي عند حذف أي مستخدم
create or replace function cleanup_user_on_delete() returns trigger as $$
begin
  if to_regclass('public.attendance_log')        is not null then delete from public.attendance_log        where user_id = old.id; end if;
  if to_regclass('public.evaluations')           is not null then delete from public.evaluations           where user_id = old.id; end if;
  if to_regclass('public.player_notes')          is not null then delete from public.player_notes          where user_id = old.id; end if;
  if to_regclass('public.subscription_payments') is not null then delete from public.subscription_payments where user_id = old.id; end if;
  if to_regclass('public.store_orders')          is not null then delete from public.store_orders          where user_id = old.id; end if;
  if old.auth_uid is not null then
    delete from auth.users where id = old.auth_uid;  -- يحذف الهوية تلقائيًا (cascade)
  end if;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cleanup_user_on_delete on public.users;
create trigger trg_cleanup_user_on_delete
after delete on public.users
for each row execute function cleanup_user_on_delete();

-- 2) تنظيف حسابات مصادقة يتيمة سبق حذف ملفها (تمنع إعادة استخدام نفس الهوية)
delete from auth.users a
where a.email like '%@academy.local'
  and not exists (select 1 from public.users u where u.auth_uid = a.id);
