import { localDB } from './local'
import { supabaseDB } from './supabase'

// ─── DB index ────────────────────────────────────────────────────────────────
// Exports the active DB implementation based on DB_MODE env var.
// Note: Supabase methods are ASYNC, local methods are SYNC (wrapped in async for consistency).
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const mode = 'supabase'; // Force Supabase as requested

export const db: any = supabaseDB;
export const dbMode = mode;
