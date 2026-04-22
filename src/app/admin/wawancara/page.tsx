import { supabase } from '@/lib/supabase/client';
import WawancaraAdminClient from './WawancaraAdminClient';

export default async function WawancaraAdminPage() {
  const { data: initialData } = await supabase.from('soal_wawancara').select('*').order('id', { ascending: true });
  return <WawancaraAdminClient initialData={initialData || []} />;
}
