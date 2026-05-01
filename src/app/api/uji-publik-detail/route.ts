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
      next: { revalidate: 900 }, // cache 15 menit
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
    });

    if (!res.ok) throw new Error('Gagal mengambil detail dari NEVOS');
    const html = await res.text();

    // Extract event title
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Extract categories
    const categoryRegex = /<a[^>]*href=['"]ujipublik_peserta\.php\?[^'"]*id_kategori=(\d+)[^'"]*['"][^>]*>(.*?)<\/a>/g;
    let catMatch;
    const categories: { id: string; name: string; sig: string }[] = [];
    while ((catMatch = categoryRegex.exec(html)) !== null) {
      const hrefMatch = html.substring(catMatch.index, catMatch.index + 500).match(/href=['"]ujipublik_peserta\.php\?([^'"]+)['"]/);
      if (hrefMatch) {
        const params = new URLSearchParams(hrefMatch[1]);
        categories.push({
          id: params.get('id_kategori') || catMatch[1],
          name: catMatch[2].replace(/<[^>]+>/g, '').trim(),
          sig: params.get('sig') || ''
        });
      }
    }

    // Also try table rows to get categories
    const rowRegex = /<tr>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<td[^>]*><a[^>]*href='(ujipublik_peserta\.php\?[^']+)'[^>]*>/g;
    let rowMatch;
    const tableRows: { name: string; href: string }[] = [];
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const name = rowMatch[1].replace(/<[^>]+>/g, '').trim();
      if (name && !name.match(/^No$/) && !name.match(/^Kategori/)) {
        const params = new URLSearchParams(rowMatch[2].split('?')[1]);
        tableRows.push({
          name,
          href: rowMatch[2]
        });
      }
    }

    return NextResponse.json({ title, categories, tableRows, rawHtml: html.substring(0, 5000) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
