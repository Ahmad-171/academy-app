-- ══════════════════════════════════════════════════════════════
-- فحص قاعدة البيانات (قراءة فقط — لا يعدّل أي شيء).
-- شغّل كل استعلام على حدة، وانسخ النتيجة وأرسلها.
-- ══════════════════════════════════════════════════════════════

-- (1) كل الجداول وعدد صفوفها التقريبي
select relname as table_name, n_live_tup as rows
from pg_stat_user_tables
order by n_live_tup desc;

-- (2) الأعمدة في كل جدول (للكشف عن أعمدة قديمة لا تُستخدم)
select table_name,
       string_agg(column_name || ' : ' || data_type, ', ' order by ordinal_position) as columns
from information_schema.columns
where table_schema = 'public'
group by table_name
order by table_name;

-- (3) حالة جدول users (كلمة سر قديمة؟ حسابات بلا مصادقة؟)
select
  count(*)                                          as total_users,
  count(*) filter (where auth_uid is null)          as without_auth,
  bool_or(column_name = 'password')                 as has_password_column
from public.users
left join information_schema.columns c
  on c.table_name = 'users' and c.table_schema = 'public' and c.column_name = 'password'
group by ();

-- (4) صفوف يتيمة: بيانات مرتبطة بمستخدمين محذوفين
select 'attendance_log' as t, count(*) from public.attendance_log where user_id not in (select id from public.users)
union all select 'evaluations',   count(*) from public.evaluations   where user_id not in (select id from public.users)
union all select 'player_notes',  count(*) from public.player_notes  where user_id not in (select id from public.users);

-- (5) مفاتيح الإعدادات المحفوظة
select key, left(value, 80) as value_preview from public.settings order by key;

-- (6) حسابات المصادقة مقابل صفوف المستخدمين (كشف حسابات auth يتيمة)
select
  (select count(*) from auth.users)                                   as auth_accounts,
  (select count(*) from public.users)                                 as user_rows,
  (select count(*) from auth.users a
     where not exists (select 1 from public.users u where u.auth_uid = a.id)) as auth_without_profile;
