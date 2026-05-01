import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const sig = searchParams.get('sig');

  if (!id || !sig) {
    return NextResponse.json({ error: 'ID dan sig diperlukan' }, { status: 400 });
  }

  try {
    const url = `https://nevos.gmim.or.id/ujipublik_detail.php?id=${id}&sig=${sig}`;
    const res = await fetch(url, {
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
    });

    if (!res.ok) throw new Error('Gagal mengambil detail dari NEVOS');
    let html = await res.text();

    // Fix relative URLs ke absolute supaya CSS/JS/gambar NEVOS tetap muncul
    html = html
      .replace(/(href|src)="(?!http|\/\/|data:)([^"]+)"/g, '$1="https://nevos.gmim.or.id/$2"')
      .replace(/(href|src)='(?!http|\/\/|data:)([^']+)'/g, "$1='https://nevos.gmim.or.id/$2'");

    // Hapus meta X-Frame-Options jika ada dalam HTML
    html = html.replace(/<meta[^>]*X-Frame-Options[^>]*>/gi, '');

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Tidak set X-Frame-Options agar bisa di-embed
        'Cache-Control': 'public, s-maxage=900',
      }
    });
  } catch (error: any) {
    return new NextResponse(`
      <html><body style="font-family:sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#dc2626">Gagal memuat data</h2>
        <p style="color:#6b7280">${error.message}</p>
        <a href="https://nevos.gmim.or.id/ujipublik_detail.php?id=${id}&sig=${sig}" 
           target="_blank" style="color:#7c3aed;font-weight:bold;">
          Buka langsung di NEVOS →
        </a>
      </body></html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
