-- ══════════════════════════════════════════════════════════════
-- أرقام العضوية حسب الدور:
--   لاعب  → تبدأ من 10000  (الدخول برقم العضوية)
--   مدرب  → تبدأ من 1000   (الدخول برقم العضوية)
--   ولي أمر وغيره → بدون رقم عضوية، الدخول برقم الهوية
--
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- ══════════════════════════════════════════════════════════════

create sequence if not exists coach_seq start 1000;

create or replace function create_member(
  p_id text, p_pass text, p_name text, p_role text, p_hidden boolean default false
) returns integer as $$
declare v_no integer; v_login text; v_email text; v_uid uuid;
begin
  if not is_admin() then raise exception 'غير مصرّح'; end if;
  if exists (select 1 from public.users where id = p_id) then raise exception 'رقم الهوية مستخدم مسبقًا'; end if;
  if p_role = 'لاعب' then
    v_no := nextval('member_seq'); v_login := v_no::text;
  elsif p_role = 'مدرب' then
    v_no := nextval('coach_seq');  v_login := v_no::text;
  else
    v_no := null; v_login := p_id;   -- ولي الأمر وغيره: الدخول برقم الهوية
  end if;
  v_email := v_login || '@academy.local';
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
