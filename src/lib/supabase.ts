import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Automatically extract ONLY protocol + domain (e.g. https://xyz.supabase.co)
// even if user pasted extra slashes or /rest/v1 in Vercel!
let sanitizedUrl = rawUrl.trim().replace(/['"]/g, '');
if (sanitizedUrl.startsWith('http')) {
  try {
    const urlObj = new URL(sanitizedUrl);
    sanitizedUrl = `${urlObj.protocol}//${urlObj.host}`;
  } catch (e) {
    sanitizedUrl = sanitizedUrl.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/i, '');
  }
}

const supabaseAnonKey = rawKey.trim().replace(/['"]/g, '');

const isConfigured = Boolean(sanitizedUrl && sanitizedUrl.startsWith('http') && !sanitizedUrl.includes('placeholder'));

const validUrl = isConfigured ? sanitizedUrl : 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder';

export const isSupabaseConfigured = isConfigured;

export const supabase = createClient(validUrl, validKey);
