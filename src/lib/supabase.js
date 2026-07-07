import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://wpiskutcxqcubamnmnbf.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_E-r_JsMpVkWeta-oOVsILQ_ur8n-85e'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
