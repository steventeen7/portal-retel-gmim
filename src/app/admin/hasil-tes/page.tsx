import { supabaseAdmin } from '@/lib/supabase/admin';
import HasilTesAdminClient from './HasilTesAdminClient';

export default async function HasilTesAdminPage() {
  const { data: tertulis } = await supabaseAdmin
    .from('nilai_user')
    .select('*, profiles(id, full_name, jemaat, email)')
    .order('created_at', { ascending: false });

  const { data: simulasi } = await supabaseAdmin
    .from('simulation_history')
    .select('*, profiles(id, full_name, jemaat, email)')
    .order('created_at', { ascending: false });
  
  return <HasilTesAdminClient initialTertulis={tertulis || []} initialSimulasi={simulasi || []} />;
}
