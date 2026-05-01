-- 1. Tambahkan kolom paket ke soal_tes
ALTER TABLE soal_tes ADD COLUMN IF NOT EXISTS paket VARCHAR(10) DEFAULT 'A';

-- 2. Tambahkan kolom paket ke paket_aktif
ALTER TABLE paket_aktif ADD COLUMN IF NOT EXISTS paket VARCHAR(10) DEFAULT 'A';

-- 3. Tambahkan kolom paket ke riwayat_tes (untuk tracking hasil per paket)
ALTER TABLE riwayat_tes ADD COLUMN IF NOT EXISTS paket VARCHAR(10) DEFAULT 'A';

-- 4. Update unique constraint pada paket_aktif
ALTER TABLE paket_aktif DROP CONSTRAINT IF EXISTS paket_aktif_tahun_key;
ALTER TABLE paket_aktif ADD CONSTRAINT paket_aktif_tahun_paket_unique UNIQUE (tahun, paket);

-- 5. OTOMATIS PECAH 500 SOAL 2026 MENJADI 10 PAKET (A-J)
UPDATE soal_tes SET paket = 'A' WHERE tahun = 2026 AND nomor_soal BETWEEN 1 AND 50;
UPDATE soal_tes SET paket = 'B' WHERE tahun = 2026 AND nomor_soal BETWEEN 51 AND 100;
UPDATE soal_tes SET paket = 'C' WHERE tahun = 2026 AND nomor_soal BETWEEN 101 AND 150;
UPDATE soal_tes SET paket = 'D' WHERE tahun = 2026 AND nomor_soal BETWEEN 151 AND 200;
UPDATE soal_tes SET paket = 'E' WHERE tahun = 2026 AND nomor_soal BETWEEN 201 AND 250;
UPDATE soal_tes SET paket = 'F' WHERE tahun = 2026 AND nomor_soal BETWEEN 251 AND 300;
UPDATE soal_tes SET paket = 'G' WHERE tahun = 2026 AND nomor_soal BETWEEN 301 AND 350;
UPDATE soal_tes SET paket = 'H' WHERE tahun = 2026 AND nomor_soal BETWEEN 351 AND 400;
UPDATE soal_tes SET paket = 'I' WHERE tahun = 2026 AND nomor_soal BETWEEN 401 AND 450;
UPDATE soal_tes SET paket = 'J' WHERE tahun = 2026 AND nomor_soal BETWEEN 451 AND 500;
