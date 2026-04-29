const { createClient } = require('@supabase/supabase-js');

const url = "https://lkqjeyedaeucfbrsvbyj.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWpleWVkYWV1Y2ZicnN2YnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODExODIsImV4cCI6MjA5MjI1NzE4Mn0.ItHO_lypuEpssoxPW8JkoO3D49kOWxtJYyQDFiWrTX4";

const supabase = createClient(url, anon);

async function check() {
  const { data: p, error: pe } = await supabase.from('profiles').select('count', { count: 'exact' });
  console.log('Profiles count:', p?.[0]?.count || 0, pe?.message || '');

  const { data: m, error: me } = await supabase.from('materi_belajar').select('count', { count: 'exact' });
  console.log('Materi count:', m?.[0]?.count || 0, me?.message || '');

  const { data: s, error: se } = await supabase.from('soal_tes').select('count', { count: 'exact' });
  console.log('Soal count:', s?.[0]?.count || 0, se?.message || '');
}

check();
