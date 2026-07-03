-- =====================================================================
-- أكاديمية النجوم — الخطوة ١: تجهيز عمود ربط الحسابات بـ Supabase Auth
-- =====================================================================
-- شغّل هذا الملف أولاً (قبل تفعيل RLS) من Supabase Dashboard → SQL Editor.
-- بعده مباشرة شغّل scripts/migrate-to-auth.mjs — يحتاج قراءة عمود
-- password بمفتاح anon قبل ما تُقفل الصلاحيات بالخطوة ٢.
--
-- قبل التشغيل: Authentication → Providers → Email → عطّل "Confirm email"
-- (لأن الإيميلات المولّدة وهمية بصيغة {id}@academy.local)
-- =====================================================================

alter table public.users
  add column if not exists auth_uid uuid references auth.users(id) on delete set null;

create unique index if not exists users_auth_uid_idx on public.users(auth_uid);
