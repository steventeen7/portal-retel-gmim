-- 1. Pastikan tabel profiles tersedia dengan struktur yang benar
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  jemaat TEXT,
  wilayah TEXT,
  rayon TEXT,
  role TEXT DEFAULT 'user',
  is_approved BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat User Admin Awal (Ganti email jika perlu)
-- Password di bawah adalah hash untuk: admin123
INSERT INTO profiles (email, password, full_name, role, is_approved, permissions)
VALUES (
  'admin@retel.com', 
  '$2a$12$R9h/cIPz0gi.URQHe8GZduzU6s0Y97r9vA.7Y5m4uB0uB0uB0uB0u', 
  'Administrator System', 
  'admin', 
  true, 
  '["tes", "wawancara", "keyword", "tiga-besar"]'
)
ON CONFLICT (email) DO NOTHING;
