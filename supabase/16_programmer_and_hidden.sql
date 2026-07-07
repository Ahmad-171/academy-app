-- ════════════════════════════════════════════════════════════════════
-- 1) حساب 111 يصير «حساب مبرمج» (بصلاحيات المدير الكاملة + يرى المخفيين)
-- 2) إنشاء 3 حسابات مخفية: مدرب + لاعب + ولي أمر
-- 3) تثبيت الحذف التلقائي الكامل عند حذف أي حساب
-- 4) تنظيف حسابات المصادقة اليتيمة (تسمح بإعادة استخدام أرقام هوية محذوفة)
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- دوال الصلاحيات: «مبرمج» يُعامَل مثل «مدير»
create or replace function is_admin() returns boolean as $$
  select coalesce((select role in ('مدير','مبرمج') from public.users where auth_uid = auth.uid() limit 1), false);
$$ language sql security definer stable;

create or replace function has_perm(p text) returns boolean as $$
  select coalesce((select role in ('مدير','مبرمج') or coalesce((permissions->>p)::boolean, false)
                   from public.users where auth_uid = auth.uid() limit 1), false);
$$ language sql security definer stable;

-- دالة مساعدة لإنشاء حساب كامل (مصادقة + هوية + ملف)
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

-- (1) حساب 111 = حساب مبرمج مخفي
update public.users set name = 'حساب مبرمج', role = 'مبرمج', custom_role = 'مبرمج', hidden = true
where id = '111';

-- (2) ثلاثة حسابات مخفية (غيّر الأرقام وكلمات السر إن رغبت)
select create_academy_account('1000000001', 'coach123',  'مدرب مخفي',    'مدرب',    true);
select create_academy_account('1000000002', 'player123', 'لاعب مخفي',    'لاعب',    true, null, '1000000001');
select create_academy_account('1000000003', 'parent123', 'ولي أمر مخفي', 'ولي أمر', true, '1000000002', null);

-- (3) حذف تلقائي كامل عند حذف أي حساب
create or replace function cleanup_user_on_delete() returns trigger as $$
begin
  if to_regclass('public.attendance_log')        is not null then delete from public.attendance_log        where user_id = old.id; end if;
  if to_regclass('public.evaluations')           is not null then delete from public.evaluations           where user_id = old.id; end if;
  if to_regclass('public.player_notes')          is not null then delete from public.player_notes          where user_id = old.id; end if;
  if to_regclass('public.subscription_payments') is not null then delete from public.subscription_payments where user_id = old.id; end if;
  if to_regclass('public.store_orders')          is not null then delete from public.store_orders          where user_id = old.id; end if;
  if old.auth_uid is not null then delete from auth.users where id = old.auth_uid; end if;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cleanup_user_on_delete on public.users;
create trigger trg_cleanup_user_on_delete after delete on public.users
for each row execute function cleanup_user_on_delete();

-- (4) تنظيف حسابات مصادقة يتيمة سبق حذف ملفها
delete from auth.users a
where a.email like '%@academy.local'
  and not exists (select 1 from public.users u where u.auth_uid = a.id);
