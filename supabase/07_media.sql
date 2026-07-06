-- =====================================================================
-- NZ Academy — الخطوة ٧: رفع الصور والفيديوهات + خلفية الرئيسية
-- =====================================================================
-- شغّل هذا الملف مرة واحدة من Supabase SQL Editor.
-- (عرض تجريبي بدون RLS — سياسات التخزين عامة للقراءة والكتابة.)
-- =====================================================================

-- عمود رابط الوسائط بجدول المكتبة/المعرض
alter table public.library add column if not exists media_url text;

-- مساحة تخزين عامة للصور والفيديوهات وخلفية الصفحة الرئيسية
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- سياسات التخزين (قراءة عامة + رفع وحذف عام لبيئة العرض)
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id = 'media');

drop policy if exists media_public_write on storage.objects;
create policy media_public_write on storage.objects for insert with check (bucket_id = 'media');

drop policy if exists media_public_delete on storage.objects;
create policy media_public_delete on storage.objects for delete using (bucket_id = 'media');
