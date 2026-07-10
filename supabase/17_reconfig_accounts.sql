-- ══════════════════════════════════════════════════════════════
-- ضبط الحسابات المخفية الأربعة بأرقام وأسماء وكلمات سر محددة.
-- شغّله مرة واحدة في Supabase → SQL Editor.
--   111 = حساب مبرمج (مبرمج)      | يوزر 111 | سر 111
--   222 = مدرب مبرمج (مدرب)        | يوزر 222 | سر 222
--   333 = لاعب مبرمج (لاعب)        | يوزر 333 | سر 333
--   444 = ولي امر مبرمج (ولي أمر)  | يوزر 444 | سر 444
-- كلها مخفية (تظهر لحساب المبرمج 111 فقط).
-- ══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- دالة مساعدة لإنشاء/تحديث حساب كامل (مصادقة + هوية + ملف)
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

-- احذف الحسابات المخفية القديمة (بالأرقام الطويلة) إن وُجدت
delete from public.users where id in ('1000000001','1000000002','1000000003');

-- الحسابات الأربعة بالضبط كما طُلب
select create_academy_account('111','111','حساب مبرمج',   'مبرمج',   true);
select create_academy_account('222','222','مدرب مبرمج',   'مدرب',    true);
select create_academy_account('333','333','لاعب مبرمج',   'لاعب',    true, null, '222');
select create_academy_account('444','444','ولي امر مبرمج','ولي أمر', true, '333', null);

-- تنظيف أي حسابات مصادقة يتيمة
delete from auth.users a
where a.email like '%@academy.local'
  and not exists (select 1 from public.users u where u.auth_uid = a.id);
