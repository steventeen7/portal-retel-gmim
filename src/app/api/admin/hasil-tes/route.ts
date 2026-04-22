import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    // Ambil data nilai tertulis (Tahun)
    const { data: tertulis, error: err1 } = await supabase
      .from('nilai_user')
      .select('*, profiles(id, full_name, jemaat, email)')
      .order('created_at', { ascending: false });
      
    if (err1) throw err1;

    // Ambil data simulasi (Wawancara, Keyword, 3 Besar)
    const { data: simulasi, error: err2 } = await supabase
      .from('simulation_history')
      .select('*, profiles(id, full_name, jemaat, email)')
      .order('created_at', { ascending: false });

    if (err2) throw err2;

    return NextResponse.json({ tertulis: tertulis || [], simulasi: simulasi || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, type } = await req.json();
    if (!id || !type) throw new Error('ID and Type required');

    let error;
    if (type === 'tertulis') {
      const { error: e } = await supabase.from('nilai_user').delete().eq('id', id);
      error = e;
    } else {
      const { error: e } = await supabase.from('simulation_history').delete().eq('id', id);
      error = e;
    }

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
