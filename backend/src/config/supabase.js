import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Resolve env vars supporting both new (publishable/secret) and legacy (anon/service_role) naming
// New keys from Supabase dashboard: https://supabase.com/dashboard/project/_/settings/api-keys
const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || null;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const jwksUrl = process.env.SUPABASE_JWKS_URL || (url ? `${url}/auth/v1/.well-known/jwks.json` : null);

// Use secret key for server-side privileged access (bypasses RLS), fallback to publishable
const serviceKey = secretKey || publishableKey;

// Warn if secret key looks like masked placeholder (contains •)
if (secretKey && secretKey.includes('•')) {
  console.warn('[supabase] SUPABASE_SECRET_KEY looks masked (contains •). Replace with full key from Supabase dashboard > API Keys. Using memory store until fixed.');
}

let supabase = null;
let supabaseAdmin = null;
let supabaseAnon = null;

if (url && serviceKey && !serviceKey.includes('•')) {
  supabase = createClient(url, serviceKey);
  supabaseAdmin = secretKey && !secretKey.includes('•') ? createClient(url, secretKey) : supabase;
  supabaseAnon = publishableKey && !publishableKey.includes('•') ? createClient(url, publishableKey) : supabase;
} else if (url && publishableKey && !publishableKey.includes('•')) {
  // publishable-only (frontend-like, RLS still applies)
  supabase = createClient(url, publishableKey);
  supabaseAnon = supabase;
  console.warn('[supabase] Only publishable/anon key set. Admin operations (service_role) will be limited to RLS. Set SUPABASE_SECRET_KEY for full backend access.');
} else {
  console.warn('Supabase env not set or using placeholder keys - using mock memory store. Set SUPABASE_URL and SUPABASE_* keys in .env for Postgres production. See .env.example');
}

if (url && !jwksUrl) {
  console.warn('[supabase] SUPABASE_JWKS_URL not set, derived from SUPABASE_URL. For Edge Functions this is auto-injected.');
}

// Re-export env for @supabase/server (used via withSupabase({ env }) on Edge Functions)
// On Edge Functions you can import directly without install: import { withSupabase } from "npm:@supabase/server"
export const supabaseEnv = {
  url,
  publishableKey,
  secretKey,
  jwksUrl,
};

export { supabaseAdmin, supabaseAnon, publishableKey, secretKey, jwksUrl };
export default supabase;
