import { supabase } from "./supabase";

// يرفع ملفًا إلى مساحة التخزين العامة ويرجع رابطه العلني.
// prefix اختياري لتنظيم الملفات (مثال: "library" أو "hero").
export async function uploadMedia(file, prefix = "") {
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `${prefix ? prefix + "/" : ""}${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  if (error) return { error: error.message };
  const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
  return { url };
}
