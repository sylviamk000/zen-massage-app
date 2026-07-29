import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up whitespace or accidental quotes
const supabaseUrl = rawUrl.trim().replace(/\/$/, '');
const supabaseAnonKey = rawKey.trim();

// Fallback dummy URL to prevent client crash if env vars are missing or invalid
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';

const validKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(validUrl, validKey);
