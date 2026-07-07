-- إظهار الفعاليات/الرسائل في الصفحة الرئيسية
-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor.

alter table notifications add column if not exists show_on_home boolean default false;
