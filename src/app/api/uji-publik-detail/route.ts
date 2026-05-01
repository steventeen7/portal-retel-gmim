import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Ambil parameter id & sig (cara lama) atau path (cara baru lebih fleksibel)
  let targetPath = searchParams.get('path');
  const id = searchParams.get('id');
  const sig = searchParams.get('sig');

  // Jika dipanggil via id & sig, susun path detail
  if (!targetPath && id && sig) {
    targetPath = `ujipublik_detail.php?id=${id}&sig=${sig}`;
  }

  if (!targetPath) {
    return new NextResponse('Path tidak ditemukan', { status: 400 });
  }

  try {
    const url = `https://nevos.gmim.or.id/${targetPath}`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
    });

    if (!res.ok) throw new Error(`NEVOS merespon dengan status ${res.status}`);
    let html = await res.text();

    // 1. REWRITE LINKS (.php) agar tetap lewat PROXY kita
    // Lakukan ini DULU sebelum merubah yang lain jadi absolute
    const proxyBase = '/api/uji-publik-detail?path=';
    
    // Match links yang ke .php (baik relatif maupun yang mungkin sudah absolute)
    // Kita tangkap semua yang mengandung ujipublik_...php
    html = html.replace(/href=["']((?:https:\/\/nevos\.gmim\.or\.id\/)?(ujipublik_[^"']+\.php[^"']*))["']/g, (match, p1, p2) => {
      // p1 adalah full link, p2 adalah path-nya saja
      return `href="${proxyBase}${encodeURIComponent(p2)}"`;
    });

    // 2. REWRITE ASSETS (CSS, JS, Images) ke absolute URL NEVOS
    html = html.replace(/(href|src)="(?!\/|http|\/\/|data:)([^"]+)"/g, '$1="https://nevos.gmim.or.id/$2"')
               .replace(/(href|src)='(?!\/|http|\/\/|data:)([^']+)'/g, "$1='https://nevos.gmim.or.id/$2'");

    // 3. Tambahkan script bridge
    const injectScript = `
      <script>
        // Paksa semua link .php tetap lewat proxy jika ada yang terlewat regex
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (!link) return;
          const href = link.getAttribute('href') || '';
          
          if (href.includes('ujipublik.php')) {
            e.preventDefault();
            window.parent.postMessage('close_detail', '*');
          } else if (href.includes('.php') && !href.includes('/api/')) {
            // Jika ada link .php yang belum diproxy, arahkan manual
            e.preventDefault();
            const cleanPath = href.replace('https://nevos.gmim.or.id/', '');
            window.location.href = '${proxyBase}' + encodeURIComponent(cleanPath);
          }
        });
      </script>
    `;
    
    html = html.replace('</body>', `${injectScript}</body>`);

    // 4. Hapus meta/header penghalang frame
    html = html.replace(/<meta[^>]*X-Frame-Options[^>]*>/gi, '');

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300',
        'X-Frame-Options': 'ALLOWALL'
      }
    });
  } catch (error: any) {
    return new NextResponse(`
      <html><body style="font-family:sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#dc2626">Gagal memuat data</h2>
        <p style="color:#6b7280">${error.message}</p>
        <button onclick="window.parent.postMessage('close_detail', '*')" 
                style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">
          Kembali ke Daftar
        </button>
      </body></html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
