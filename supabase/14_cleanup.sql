-- ══════════════════════════════════════════════════════════════
-- تنظيف قاعدة البيانات: إزالة سياسات مفتوحة وجداول/أعمدة زائدة.
-- راجع كل قسم قبل تشغيله. أقسام الحذف نهائية.
-- ══════════════════════════════════════════════════════════════

-- (1) 🔴 مهم: أزل سياسة «allow all» المفتوحة عن المالية (تُلغي الحماية)
drop policy if exists "allow all" on public.finance;

-- (2) جداول ميزات محذوفة (البطولات) — لم تعد مستخدمة في الموقع
drop table if exists public.tournament_scorers;
drop table if exists public.tournament_teams;

-- (3) جدول الجداول (schedule) — صفحته غير موجودة في التنقّل الحالي.
--     احذف التعليق إذا متأكد أنك لا تريد ميزة الجداول.
-- drop table if exists public.schedule;

-- (4) عمود الحضور القديم (مصفوفة على users) — استبدلناه بجدول attendance_log.
--     احذف التعليق لإزالته.
-- alter table public.users drop column if exists attendance_log;

-- (5) عمود كلمة السر القديم (إن لم تشغّل ملف 11 بعد)
-- alter table public.users drop column if exists password;
