const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing URL:', url);
console.log('Testing Key Length:', key?.length);

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('materi_belajar').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Data fetched:', data.length);
  }
}

test();
