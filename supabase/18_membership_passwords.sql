-- ════════════════════════════════════════════════════════════════════
-- أرقام العضوية (تبدأ من 10000) + إنشاء الأعضاء + إعادة تعيين كلمة السر.
-- شغّله مرة واحدة بعد FINAL.sql. (مضمّن أيضًا في FINAL.sql للتنصيب النظيف.)
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- تسلسل أرقام العضوية للأعضاء الجدد
create sequence if not exists member_seq start 10000;

-- عمود رقم العضوية (هو معرّف تسجيل الدخول)
alter table public.users add column if not exists membership_no integer unique;

-- الحسابات الخاصة الحالية (111/222/...) تبقى بأرقامها كأرقام عضوية
update public.users set membership_no = id::integer
where membership_no is null and id ~ '^\d+$' and id::integer < 10000;

-- اجعل التسلسل يبدأ فوق أي رقم عضوية موجود
select setval('member_seq', greatest(10000, coalesce((select max(membership_no) from public.users where membership_no >= 10000), 9999)) + 1, false);

-- ── إنشاء عضو جديد: يخصّص رقم عضوية ويُنشئ حساب المصادقة (بريده = رقم العضوية) ──
-- يُستدعى من التطبيق عبر RPC. يتحقق أن المُستدعي مدير/مبرمج.
create or replace function create_member(
  p_id text, p_pass text, p_name text, p_role text, p_hidden boolean default false
) returns integer as $$
declare v_no integer; v_email text; v_uid uuid;
begin
  if not is_admin() then raise exception 'غير مصرّح'; end if;
  if exists (select 1 from public.users where id = p_id) then raise exception 'رقم الهوية مستخدم مسبقًا'; end if;
  v_no := nextval('member_seq');
  v_email := v_no || '@academy.local';
  v_uid := gen_random_uuid();
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change)
  values ('00000000-0000-0000-0000-000000000000',v_uid,'authenticated','authenticated',v_email,crypt(p_pass,gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,'','','','');
  insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values (v_uid::text,v_uid,jsonb_build_object('sub',v_uid::text,'email',v_email,'email_verified',true),'email',now(),now(),now());
  insert into public.users (id,auth_uid,membership_no,name,role,custom_role,status,hidden,permissions,points,attendance)
  values (p_id,v_uid,v_no,p_name,p_role,p_role,'نشط',p_hidden,'{}'::jsonb,0,0);
  return v_no;
end;
$$ language plpgsql security definer;

-- ── إعادة تعيين كلمة سر أي عضو بدون معرفة القديمة (للمدير/المبرمج فقط) ──
create or replace function reset_member_password(p_user_id text, p_new_pass text)
returns void as $$
declare v_uid uuid;
begin
  if not is_admin() then raise exception 'غير مصرّح'; end if;
  if length(coalesce(p_new_pass,'')) < 6 then raise exception 'كلمة السر يجب أن تكون 6 خانات على الأقل'; end if;
  select auth_uid into v_uid from public.users where id = p_user_id;
  if v_uid is null then raise exception 'الحساب غير موجود'; end if;
  update auth.users set encrypted_password = crypt(p_new_pass, gen_salt('bf')), updated_at = now() where id = v_uid;
end;
$$ language plpgsql security definer;
