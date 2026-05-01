import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache 1 jam

export async function GET() {
  try {
    // 1. Ambil daftar kegiatan
    const mainRes = await fetch('https://nevos.gmim.or.id/ujipublik.php', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' },
      next: { revalidate: 3600 }
    });
    const mainHtml = await mainRes.text();

    // Regex untuk mencari link detail kegiatan Remaja Teladan 2026
    const eventRegex = /<td class='text-center'>\d+<\/td>\s*<td><strong>([\s\S]*?)<\/strong><\/td>[\s\S]*?<a href='(ujipublik_detail\.php\?id=\d+&sig=[a-f0-9]+)'/g;
    let match;
    const events = [];

    while ((match = eventRegex.exec(mainHtml)) !== null) {
      const title = match[1];
      const detailUrl = match[2];
      // Hanya ambil kegiatan Rayon 2026
      if (title.toLowerCase().includes('remaja teladan') && (title.includes('2026') || title.includes('2025'))) {
        events.push({ title, detailUrl });
      }
    }

    // 2. Untuk setiap kegiatan, ambil id_kategori (biasanya Putra/Putri)
    const allParticipants: any[] = [];

    // Limit jumlah event yang di-fetch secara bersamaan untuk menghindari timeout
    // Kita ambil 5 event terbaru saja jika terlalu banyak
    const targetEvents = events.slice(0, 8);

    for (const event of targetEvents) {
      try {
        const detailRes = await fetch(`https://nevos.gmim.or.id/${event.detailUrl}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
        });
        const detailHtml = await detailRes.text();

        // Cari link ujipublik_peserta.php?id_kategori=...
        const catRegex = /href='(ujipublik_peserta\.php\?id_kategori=\d+&id=\d+&sig=[a-f0-9]+)'/g;
        let catMatch;
        const categories = [];
        while ((catMatch = catRegex.exec(detailHtml)) !== null) {
          categories.push(catMatch[1]);
        }

        // 3. Ambil peserta dari setiap kategori
        for (const catUrl of categories) {
          const pRes = await fetch(`https://nevos.gmim.or.id/${catUrl}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalRetelGMIM/1.0)' }
          });
          const pHtml = await pRes.text();

          // Parse tabel peserta
          // Baris: <tr>...<td>NO</td><td>NAMA</td><td>JEMAAT<br>RAYON</td>...<td>NILAI</td>...</tr>
          // Nilai ada di kolom ke-10 (indeks 9 jika di-split td)
          const rowRegex = /<tr>\s*<td>\d+<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/g;
          let rowMatch;
          
          // Cleaner regex for score - look for the 10th <td>
          const tableRegex = /<table.*?>([\s\S]*?)<\/table>/;
          const tableMatch = pHtml.match(tableRegex);
          if (tableMatch) {
            const tableContent = tableMatch[1];
            const rows = tableContent.split('</tr>');
            
            for (const row of rows) {
              const cellsRaw = row.split(/<td.*?>/i).slice(1);
              if (cellsRaw.length >= 10) {
                const name = cellsRaw[0].replace(/<[^>]*>?/gm, '').trim();
                const jemaatHtml = cellsRaw[1]; // Kolom Jemaat & Rayon (masih ada <br>)
                
                if (name && name !== 'Peserta') {
                  const parts = jemaatHtml.split(/<br\s*\/?>/i);
                  const jemaat = parts[0].replace(/<[^>]*>?/gm, '').trim();
                  const rayon = (parts[1] || '').replace(/<[^>]*>?/gm, '').trim();
                  
                  const scoreRaw = cellsRaw[9].replace(/<[^>]*>?/gm, '').trim();
                  const score = parseFloat(scoreRaw);

                  if (!isNaN(score) && score > 0) {
                    allParticipants.push({
                      name,
                      jemaat: jemaat || '—',
                      rayon: rayon || '—',
                      score,
                      event: event.title
                    });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(`Gagal fetch event ${event.title}:`, err);
      }
    }

    // 4. Sortir dan ambil Top 20
    const top20 = allParticipants
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ 
      data: top20,
      total_scraped: allParticipants.length,
      updated_at: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
