-- ============================================================
-- PORTAL RETEL GMIM - Database Schema V2 (Supabase Migration)
-- ============================================================

-- 1. Tabel Profiles (Extensi dari Auth users atau pengganti tabel users lokal)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hanya jika tidak menggunakan Supabase Auth penuh
  full_name TEXT NOT NULL,
  jemaat TEXT,
  wilayah TEXT,
  rayon TEXT,
  role TEXT DEFAULT 'user',
  is_approved BOOLEAN DEFAULT false, -- Izin akses pendaftaran
  permissions JSONB DEFAULT '[]',     -- Modul yang bisa diakses (ex: ["tes", "wawancara"])
  last_seen TIMESTAMP WITH TIME ZONE,  -- Tracking Online Status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Soal Tes Tertulis
CREATE TABLE IF NOT EXISTS soal_tes (
  id SERIAL PRIMARY KEY,
  tahun INT NOT NULL,
  nomor_soal INT NOT NULL,
  teks_soal TEXT NOT NULL,
  opsi_a TEXT,
  opsi_b TEXT,
  opsi_c TEXT,
  opsi_d TEXT,
  jawaban_benar CHAR(1),
  tipe_soal TEXT DEFAULT 'pilihan_ganda'
);

-- 4. Tabel Nilai User
CREATE TABLE IF NOT EXISTS nilai_user (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  tahun INT,
  skor INT,
  jawaban JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Pertanyaan Wawancara
CREATE TABLE IF NOT EXISTS soal_wawancara (
  id SERIAL PRIMARY KEY,
  kategori TEXT,
  pertanyaan TEXT NOT NULL,
  jawaban_paling_tepat TEXT,
  penjelasan_jawaban TEXT
);

-- 6. Tabel Kata Kunci
CREATE TABLE IF NOT EXISTS kata_kunci (
  id SERIAL PRIMARY KEY,
  kata TEXT NOT NULL,
  materi TEXT,
  jawaban TEXT,
  penjelasan TEXT
);

-- 7. Tabel Pertanyaan 3 Besar
CREATE TABLE IF NOT EXISTS soal_tiga_besar (
  id SERIAL PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  jawaban_paling_tepat TEXT,
  penjelasan_jawaban TEXT,
  level TEXT DEFAULT 'final'
);

-- 8. Tabel Materi Belajar
CREATE TABLE IF NOT EXISTS materi_belajar (
  id SERIAL PRIMARY KEY,
  kategori TEXT NOT NULL,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL
);

-- 9. Tabel Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  from_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  to_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabel Simulasi History
CREATE TABLE IF NOT EXISTS simulation_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  total_soal INT,
  skor INT,
  waktu_tempuh INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger untuk update timestamp jika diperlukan (opsional)
-- Data Awal Admin (Contoh - Ganti password dengan hash bcrypt)
-- INSERT INTO profiles (email, password, full_name, role, is_approved, permissions) 
-- VALUES ('admin@retel.com', '$2b$12$...', 'Super Admin', 'admin', true, '["tes", "wawancara", "keyword", "tiga-besar"]');
