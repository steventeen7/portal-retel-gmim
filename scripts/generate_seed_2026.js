const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'src/data/soal_tes.json');
const outputPath = path.join(process.cwd(), 'supabase/seed_2026_full.sql');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const s2026 = data.filter(s => s.tahun === 2026);

console.log(`Menemukan ${s2026.length} soal untuk tahun 2026.`);

const escapeSql = (str) => {
  if (!str) return '';
  return str.toString().replace(/'/g, "''");
};

let sql = `-- FULL SEED 2026 (PAKET A - J)\n`;
sql += `-- SCRIPT GENERATED FROM soal_tes.json\n\n`;
sql += `DELETE FROM soal_tes WHERE tahun = 2026;\n\n`;
sql += `INSERT INTO soal_tes (tahun, nomor_soal, teks_soal, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar, tipe_soal) VALUES\n`;

const rows = s2026.map((s, i) => {
  return `(2026, ${s.nomor_soal}, '${escapeSql(s.teks_soal)}', '${escapeSql(s.opsi_a)}', '${escapeSql(s.opsi_b)}', '${escapeSql(s.opsi_c)}', '${escapeSql(s.opsi_d)}', '${s.jawaban_benar.toLowerCase()}', 'pilihan_ganda')`;
});

sql += rows.join(',\n');
sql += ';\n';

fs.writeFileSync(outputPath, sql);
console.log(`File berhasil dibuat: ${outputPath}`);
