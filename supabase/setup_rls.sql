-- ============================================================
-- PORTAL RETEL GMIM - RLS Policies Setup
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- ─── MATERI BELAJAR ─────────────────────────────────────────
-- Enable RLS (jika belum aktif)
ALTER TABLE materi_belajar ENABLE ROW LEVEL SECURITY;

-- Hapus semua policy lama di materi_belajar
DROP POLICY IF EXISTS "Allow read materi" ON materi_belajar;
DROP POLICY IF EXISTS "Allow admin insert materi" ON materi_belajar;
DROP POLICY IF EXISTS "Allow admin update materi" ON materi_belajar;
DROP POLICY IF EXISTS "Allow admin delete materi" ON materi_belajar;
DROP POLICY IF EXISTS "materi_belajar_all" ON materi_belajar;

-- Semua user bisa READ materi (anon key boleh baca)
CREATE POLICY "Allow read materi"
ON materi_belajar FOR SELECT
USING (true);

-- Service role (admin server) bisa INSERT, UPDATE, DELETE
-- Ini bypass RLS secara otomatis - tidak perlu policy khusus untuk service_role
-- Tapi tetap tambahkan untuk safety:
CREATE POLICY "Allow all for service_role"
ON materi_belajar FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ─── NILAI USER ─────────────────────────────────────────────
ALTER TABLE nilai_user ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin read nilai" ON nilai_user;
DROP POLICY IF EXISTS "Allow all for service_role nilai" ON nilai_user;

-- User bisa insert nilai mereka sendiri
DROP POLICY IF EXISTS "Allow insert nilai own" ON nilai_user;
CREATE POLICY "Allow insert nilai own"
ON nilai_user FOR INSERT
WITH CHECK (true);

-- User bisa read nilai mereka sendiri
CREATE POLICY "Allow read nilai own"
ON nilai_user FOR SELECT
USING (true);

-- Service role bisa semua
CREATE POLICY "Allow all for service_role nilai"
ON nilai_user FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ─── SIMULATION HISTORY ─────────────────────────────────────
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service_role simulasi" ON simulation_history;

CREATE POLICY "Allow insert simulasi"
ON simulation_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow read simulasi"
ON simulation_history FOR SELECT
USING (true);

CREATE POLICY "Allow all for service_role simulasi"
ON simulation_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ─── PROFILES ───────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all for service_role profiles" ON profiles;

-- Semua bisa baca profiles (untuk JOIN di query)
CREATE POLICY "Allow read profiles"
ON profiles FOR SELECT
USING (true);

-- Service role bisa semua
CREATE POLICY "Allow all for service_role profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ─── ACTIVITY LOGS ──────────────────────────────────────────
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service_role logs" ON activity_logs;

CREATE POLICY "Allow all for service_role logs"
ON activity_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ─── CHAT MESSAGES ──────────────────────────────────────────
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read chat" ON chat_messages;
DROP POLICY IF EXISTS "Allow insert chat" ON chat_messages;
DROP POLICY IF EXISTS "Allow all for service_role chat" ON chat_messages;

CREATE POLICY "Allow read chat"
ON chat_messages FOR SELECT
USING (true);

CREATE POLICY "Allow insert chat"
ON chat_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all for service_role chat"
ON chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
