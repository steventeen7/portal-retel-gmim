-- ============================================================
-- PORTAL RETEL GMIM - Database Schema
-- ============================================================

-- Tabel users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel soal tes tertulis
CREATE TABLE soal_tes (
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

-- Tabel nilai user
CREATE TABLE nilai_user (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tahun INT,
  skor INT,
  jawaban JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel pertanyaan wawancara
CREATE TABLE soal_wawancara (
  id SERIAL PRIMARY KEY,
  kategori TEXT,
  pertanyaan TEXT NOT NULL
);

-- Tabel kata kunci
CREATE TABLE kata_kunci (
  id SERIAL PRIMARY KEY,
  kata TEXT NOT NULL,
  materi TEXT
);

-- Tabel pertanyaan 3 besar
CREATE TABLE soal_tiga_besar (
  id SERIAL PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  level TEXT DEFAULT 'final'
);

-- Tabel materi belajar
CREATE TABLE materi_belajar (
  id SERIAL PRIMARY KEY,
  kategori TEXT NOT NULL,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL
);
