import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://nevos.gmim.or.id/ujipublik.php', {
      next: { revalidate: 1800 }, // cache 30 menit
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
    });

    if (!res.ok) throw new Error('Gagal mengambil data dari NEVOS');
    const html = await res.text();

    // Parse row data
    const regex = /<td class='text-center'>(\d+)<\/td>\s*<td><strong>(.*?)<\/strong><\/td>\s*<td class='text-center'>(.*?)<\/td>\s*<td class='text-center'><span class='badge-kategori'>(.*?)<\/span><\/td>\s*<td class='text-center'><a href='(.*?)'/g;
    let match;
    const results = [];
    while ((match = regex.exec(html)) !== null) {
      results.push({
        no: match[1],
        title: match[2],
        date: match[3],
        category: match[4],
        detailUrl: match[5],
      });
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}
