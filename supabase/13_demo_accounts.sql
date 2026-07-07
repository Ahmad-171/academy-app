-- ══════════════════════════════════════════════════════════════
-- حسابات تجريبية قابلة للإخفاء/الإظهار.
-- زر «إخفاء/إظهار» في لوحة الإدارة يظهر فقط على الحسابات المعلّمة is_demo
-- (أو أي حساب مخفي حاليًا). الحسابات الحقيقية لا يظهر عليها الزر.
-- ══════════════════════════════════════════════════════════════

alter table public.users add column if not exists hidden  boolean default false;
alter table public.users add column if not exists is_demo boolean default false;

-- علّم الحسابات التجريبية الأربعة (واحد لكل دور) واجعلها مخفية افتراضيًا.
-- غيّر أرقام الهوية بما يطابق حساباتك التجريبية إن اختلفت.
update public.users set is_demo = true, hidden = true
where id in ('111', '221', '331', '441');
