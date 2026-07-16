-- ══════════════════════════════════════════════════════════════
-- إظهار شعار الأكاديمية وألوانها من أول زيارة قبل تسجيل الدخول.
--
-- المشكلة: جدول settings محميّ بـ RLS ولا يقرأه إلا مستخدم مسجّل دخول،
-- فقبل الدخول لا يستطيع الموقع جلب الشعار فيظهر الشعار الافتراضي فقط.
--
-- الحل: سياسة قراءة عامة (anon) مقيّدة على مفاتيح الهوية البصرية فقط
-- (الشعار، الألوان، الخلفية) — لا تكشف أي بيانات حسّاسة.
--
-- شغّله مرة واحدة في Supabase → SQL Editor.
-- ══════════════════════════════════════════════════════════════

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select to anon
  using (key in ('logo_url', 'theme_colors', 'hero_background', 'brand'));
