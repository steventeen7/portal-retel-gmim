import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET: Ambil daftar paket (tahun unik) beserta status aktif/nonaktif
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Cek tabel paket_aktif, kalau belum ada akan dibuat lewat SQL
    const { data: paketData, error } = await supabase
      .from('paket_aktif')
      .select('*')
      .order('tahun', { ascending: false });

    if (error) {
      // Jika tabel belum ada, kembalikan error yang jelas
      return NextResponse.json({ error: error.message, needSetup: true }, { status: 500 });
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
    const { action, tahun, label, is_active } = body;
    const supabase = getSupabaseAdmin();

    if (action === 'sync') {
      // Ambil semua tahun unik dari soal_tes
      const { data: soalData, error: soalError } = await supabase
        .from('soal_tes')
        .select('tahun');

      if (soalError) throw soalError;

      const uniqueTahun = [...new Set((soalData || []).map((s: any) => s.tahun))];

      // Get existing paket
      const { data: existingPaket } = await supabase.from('paket_aktif').select('tahun');
      const existingTahunSet = new Set((existingPaket || []).map((p: any) => p.tahun));

      // Insert paket baru yang belum ada
      const toInsert = uniqueTahun
        .filter(t => !existingTahunSet.has(t))
        .map(t => ({
          tahun: t,
          label: labelFromTahun(t as number),
          is_active: true,
        }));

      if (toInsert.length > 0) {
        await supabase.from('paket_aktif').insert(toInsert);
      }

      const { data: finalData } = await supabase
        .from('paket_aktif')
        .select('*')
        .order('tahun', { ascending: false });

      return NextResponse.json({ data: finalData || [], synced: toInsert.length });
    }

    if (action === 'toggle') {
      const { data, error } = await supabase
        .from('paket_aktif')
        .upsert({ tahun, label, is_active }, { onConflict: 'tahun' })
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

function labelFromTahun(tahun: number): string {
  if (tahun === 2091) return 'Rangkuman 1 (2019-2025)';
  if (tahun === 2092) return 'Rangkuman 2 (2019-2025)';
  if (tahun === 2093) return 'Rangkuman 3 (2019-2025)';
  return `Paket Tahun ${tahun}`;
}
