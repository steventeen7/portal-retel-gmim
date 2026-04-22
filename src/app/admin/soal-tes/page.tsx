import { supabase } from '@/lib/supabase/client';
import SoalTesAdminClient from './SoalTesAdminClient';

export default async function SoalTesAdminPage() {
  const { data: initialSoal } = await supabase.from('soal_tes').select('*').order('tahun', { ascending: false }).order('nomor_soal', { ascending: true });
  return <SoalTesAdminClient initialSoal={initialSoal || []} />;
}
