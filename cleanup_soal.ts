import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAndImport() {
  console.log('--- Memulai Pembersihan Soal 2026 ---');
  
  // 1. Hapus semua soal tahun 2026 yang berantakan
  const { error: deleteError } = await supabase
    .from('soal_tes')
    .delete()
    .eq('tahun', 2026);
    
  if (deleteError) {
    console.error('Gagal menghapus soal lama:', deleteError);
    return;
  }
  console.log('✓ Soal lama (2026) berhasil dihapus.');

  // 2. Baca data bersih dari JSON lokal
  const jsonPath = path.join(process.cwd(), 'src/data/soal_tes.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  // Ambil hanya tahun 2026 (biasanya 50-100 soal pertama untuk Paket A-B)
  const clean2026 = rawData.filter((s: any) => s.tahun === 2026).map((s: any) => {
    // Hilangkan ID agar Supabase generate ID baru atau gunakan ID jika unik
    const { id, ...cleanSoal } = s;
    return {
      ...cleanSoal,
      // Pastikan jawaban_benar dalam lowercase agar konsisten dengan sistem scoring
      jawaban_benar: cleanSoal.jawaban_benar.toLowerCase()
    };
  });

  console.log(`Menyiapkan ${clean2026.length} soal untuk diimpor...`);

  // 3. Impor dalam batch (Supabase limit biasanya 1000 per insert, tapi kita bagi kecil saja)
  const { error: importError } = await supabase
    .from('soal_tes')
    .insert(clean2026);

  if (importError) {
    console.error('Gagal mengimpor soal baru:', importError);
    return;
  }
  
  console.log('✓ Impor soal 2026 Berhasil!');
}

cleanupAndImport();
