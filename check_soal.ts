import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnswers() {
  const { data, error } = await supabase
    .from('soal_tes')
    .select('nomor_soal, jawaban_benar')
    .eq('tahun', 2026)
    .order('nomor_soal', { ascending: true })
    .limit(50);

  if (error) {
    console.error(error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

checkAnswers();
