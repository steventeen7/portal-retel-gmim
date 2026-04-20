import { localDB } from './local'
import { supabaseDB } from './supabase'

// ─── DB index ────────────────────────────────────────────────────────────────
// Exports the active DB implementation based on DB_MODE env var.
// Note: Supabase methods are ASYNC, local methods are SYNC (wrapped in async for consistency).
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const isProd = process.env.NODE_ENV === 'production';
const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

// Force supabase in production or if env is available
const mode = process.env.DB_MODE || (isProd || hasSupabase ? 'supabase' : 'local');

export const db: any = mode === 'supabase' ? supabaseDB : localDB;
export const dbMode = mode;
