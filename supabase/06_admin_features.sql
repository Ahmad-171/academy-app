-- =====================================================================
-- NZ Academy — الخطوة ٦: ميزات الإدارة الإضافية
-- =====================================================================
-- شغّل هذا الملف بعد supabase/05_extended_fields.sql من SQL Editor.
-- يضيف حدّ الاستخدام لأكواد الخصم (وعدّاد الاستخدام الفعلي).
-- أسعار الاشتراكات القابلة للتعديل تُخزَّن بجدول settings الموجود
-- (key = 'subscription_plans') فلا تحتاج جدولًا جديدًا.
-- =====================================================================

alter table public.discount_codes add column if not exists max_uses integer;      -- NULL = بلا حد
alter table public.discount_codes add column if not exists used_count integer not null default 0;
