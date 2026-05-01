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
      next: { revalidate: 300 }, // Cache lebih pendek
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
    });

    if (!res.ok) throw new Error(`NEVOS merespon dengan status ${res.status}`);
    let html = await res.text();

    // 1. REWRITE ASSETS (CSS, JS, Images) ke absolute URL NEVOS
    // Kita biarkan ini langsung ke NEVOS karena biasanya tidak kena blokir frame
    html = html.replace(/(href|src)="(?!\/|http|\/\/|data:)([^"]+)"/g, '$1="https://nevos.gmim.or.id/$2"')
               .replace(/(href|src)='(?!\/|http|\/\/|data:)([^']+)'/g, "$1='https://nevos.gmim.or.id/$2'");
    
    // 2. REWRITE LINKS (.php) agar tetap lewat PROXY kita
    // Ini kunci agar "Lihat Peserta" dan navigasi lain di dalam iframe tidak kena "Refused to Connect"
    // Contoh: href="ujipublik_peserta.php?id=123" -> href="/api/uji-publik-detail?path=ujipublik_peserta.php?id=123"
    
    const proxyBase = '/api/uji-publik-detail?path=';
    
    // Match links yang ke .php
    html = html.replace(/href=["'](ujipublik_[^"']+\.php[^"']*)["']/g, (match, p1) => {
      return `href="${proxyBase}${encodeURIComponent(p1)}"`;
    });

    // 3. Tambahkan script kecil untuk menangani link "Kembali" agar menutup iframe di portal kita
    // Jika link mengandung 'ujipublik.php', kita buat dia memicu penutupan di parent
    const injectScript = `
      <script>
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link && (link.href.includes('ujipublik.php') || link.getAttribute('href').includes('ujipublik.php'))) {
            e.preventDefault();
            // Kirim pesan ke parent window untuk menutup detail
            window.parent.postMessage('close_detail', '*');
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
