const fs = require('fs');
const path = require('path');

const supabaseDir = path.join(__dirname, '..', 'supabase');
const files = fs.readdirSync(supabaseDir).filter(f => f.startsWith('seed_20') && f.endsWith('.sql'));

let allQuestions = [];

files.forEach(file => {
    const filePath = path.join(supabaseDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Regex to match (tahun, nomor_soal, teks_soal, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar)
    // Some might have tipe_soal at the end, but we can just blindly extract the values inside the parenthesis for INSERT INTO soal_tes
    
    // Simplest way: extract lines that start with ( and end with ), or );
    const lines = content.split('\n');
    let insideInsert = false;
    for (const line of lines) {
        if (line.includes('INSERT INTO soal_tes')) {
            insideInsert = true;
            continue;
        }
        if (insideInsert) {
            const trimmed = line.trim();
            if (trimmed.startsWith('(')) {
                allQuestions.push(trimmed.replace(/,$/, '').replace(/;$/, ''));
            }
            if (trimmed.endsWith(';')) insideInsert = false;
        }
    }
});

// Shuffle Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffleArray(allQuestions);

// We need 150 questions (50 x 3)
const selected = allQuestions.slice(0, 150);

// We have 3 packages (2091, 2092, 2093)
let sqlOutput = `-- ============================================================
-- PORTAL RETEL GMIM - SEED SOAL RANGKUMAN (2019-2025)
-- Paket 1: 2091, Paket 2: 2092, Paket 3: 2093 (Tiap paket 50 soal)
-- ============================================================

INSERT INTO soal_tes (tahun, nomor_soal, teks_soal, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar) VALUES\n`;

const rows = [];
let currentPaket = 2091;
let currentNomor = 1;

for (let i = 0; i < 150; i++) {
    // The question line looks like (2019, 1, 'teks', 'a', 'b', 'c', 'd', 'jawaban')
    // We need to replace the first two values (tahun, nomor_soal)
    
    let rawStr = selected[i];
    // Remove the leading parenthesis
    rawStr = rawStr.substring(1);
    
    // Find the second comma (after nomor_soal)
    let parts = rawStr.split(',');
    // Wait, within teks_soal there could be commas!
    // Instead of split by comma, we can use a more precise replacement.
    // The prefix is normally like `2019, 1, ` or `2024, 15, `
    
    const replaced = rawStr.replace(/^\d+\s*,\s*\d+\s*,/, `${currentPaket}, ${currentNomor},`);
    
    rows.push(`(${replaced}`);
    
    currentNomor++;
    if (currentNomor > 50) {
        currentNomor = 1;
        currentPaket++;
    }
}

sqlOutput += rows.join(',\n') + ';\n';

fs.writeFileSync(path.join(supabaseDir, 'seed_rangkuman.sql'), sqlOutput);
console.log('Successfully generated supabase/seed_rangkuman.sql with 150 questions.');
