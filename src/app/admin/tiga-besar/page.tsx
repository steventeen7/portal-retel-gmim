import { supabase } from '@/lib/supabase/client';
import TigaBesarAdminClient from './TigaBesarAdminClient';

export default async function TigaBesarAdminPage() {
  const { data: initialData } = await supabase.from('soal_tiga_besar').select('*').order('id', { ascending: true });
  return <TigaBesarAdminClient initialData={initialData || []} />;
}
