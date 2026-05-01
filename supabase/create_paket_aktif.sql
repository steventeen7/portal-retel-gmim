-- Tabel untuk mengontrol paket soal tes yang aktif/nonaktif
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS paket_aktif (
  id SERIAL PRIMARY KEY,
  tahun INTEGER UNIQUE NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Isi dengan data awal dari soal yang sudah ada
INSERT INTO paket_aktif (tahun, label, is_active)
SELECT DISTINCT 
  tahun,
  CASE 
    WHEN tahun = 2091 THEN 'Rangkuman 1 (2019-2025)'
    WHEN tahun = 2092 THEN 'Rangkuman 2 (2019-2025)'
    WHEN tahun = 2093 THEN 'Rangkuman 3 (2019-2025)'
    ELSE CONCAT('Paket Tahun ', tahun::text)
  END as label,
  true as is_active
FROM soal_tes
ON CONFLICT (tahun) DO NOTHING;

-- RLS: admin bisa baca dan ubah, user biasa hanya bisa baca
ALTER TABLE paket_aktif ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read paket_aktif" ON paket_aktif
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage paket_aktif" ON paket_aktif
  FOR ALL USING (true);
