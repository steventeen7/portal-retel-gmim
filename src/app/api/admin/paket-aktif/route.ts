import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET: Ambil daftar paket (tahun + paket unik) beserta status aktif/nonaktif
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: paketData, error } = await supabase
      .from('paket_aktif')
      .select('*')
      .order('tahun', { ascending: false })
      .order('paket', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: paketData || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Toggle status aktif/nonaktif sebuah paket, atau sync paket dari soal_tes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tahun, paket, label, is_active } = body;
    const supabase = getSupabaseAdmin();

    if (action === 'sync') {
      // Ambil semua kombinasi tahun & paket unik dari soal_tes
      const { data: soalData, error: soalError } = await supabase
        .from('soal_tes')
        .select('tahun, paket');

      if (soalError) throw soalError;

      // Group by tahun & paket
      const uniqueCombos = Array.from(new Set((soalData || []).map((s: any) => `${s.tahun}|${s.paket || 'A'}`)));

      // Get existing paket
      const { data: existingPaket } = await supabase.from('paket_aktif').select('tahun, paket');
      const existingSet = new Set((existingPaket || []).map((p: any) => `${p.tahun}|${p.paket || 'A'}`));

      // Insert paket baru yang belum ada
      const toInsert = uniqueCombos
        .filter(c => !existingSet.has(c))
        .map(c => {
          const [t, p] = c.split('|');
          return {
            tahun: parseInt(t),
            paket: p,
            label: labelFromTahunPaket(parseInt(t), p),
            is_active: true,
          };
        });

      if (toInsert.length > 0) {
        await supabase.from('paket_aktif').insert(toInsert);
      }

      const { data: finalData } = await supabase
        .from('paket_aktif')
        .select('*')
        .order('tahun', { ascending: false })
        .order('paket', { ascending: true });

      return NextResponse.json({ data: finalData || [], synced: toInsert.length });
    }

    if (action === 'toggle') {
      const { data, error } = await supabase
        .from('paket_aktif')
        .upsert({ tahun, paket, label, is_active }, { onConflict: 'tahun, paket' })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function labelFromTahunPaket(tahun: number, paket: string): string {
  if (tahun === 2091) return 'Rangkuman 1 (2019-2025)';
  if (tahun === 2092) return 'Rangkuman 2 (2019-2025)';
  if (tahun === 2093) return 'Rangkuman 3 (2019-2025)';
  if (tahun === 2026) return `2026 - Paket ${paket}`;
  return `Paket Tahun ${tahun}${paket !== 'A' ? ` - ${paket}` : ''}`;
}
