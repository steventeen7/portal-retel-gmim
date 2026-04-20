import { localDB } from './local'
import { supabaseDB } from './supabase'

// ─── DB index ────────────────────────────────────────────────────────────────
// Exports the active DB implementation based on DB_MODE env var.
// Note: Supabase methods are ASYNC, local methods are SYNC (wrapped in async for consistency).
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const mode = process.env.DB_MODE ?? 'local'

export const db: any = mode === 'supabase' ? supabaseDB : localDB
export const dbMode = mode
