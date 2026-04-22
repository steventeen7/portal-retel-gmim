import { supabase } from '@/lib/supabase/client';
import KataKunciAdminClient from './KataKunciAdminClient';

export default async function KataKunciAdminPage() {
  const { data: initialData } = await supabase.from('kata_kunci').select('*').order('id', { ascending: true });
  return <KataKunciAdminClient initialData={initialData || []} />;
}
