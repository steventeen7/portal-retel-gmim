'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatWidget from './ChatWidget';

export default function Layout({ children, user }: { children: React.ReactNode, user?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = [
    { href: '/', label: 'Beranda' },
    { href: '/latihan/tes', label: 'Tes Tertulis' },
    { href: '/latihan/wawancara', label: 'Latihan Wawancara' },
    { href: '/latihan/keyword', label: 'Latihan Kata Kunci' },
    { href: '/latihan/tiga-besar', label: 'Latihan 3 Besar' },
    { href: '/belajar', label: 'Belajar' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
      toast.success('Berhasil keluar');
    } catch {
      toast.error('Gagal keluar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-purple-800 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tight shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
             <ShieldCheck className="w-6 h-6 text-purple-300" />
             Portal Persiapan Retel GMIM
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 font-medium text-sm">
            {menu.map(item => (
              <Link key={item.href} href={item.href} className={`hover:text-purple-200 transition-colors ${pathname === item.href ? 'text-purple-200 font-bold border-b-2 border-purple-200' : 'text-purple-100'}`}>
                {item.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link href="/admin" className={`hover:text-amber-200 transition-colors text-amber-100 font-bold ${pathname.startsWith('/admin') ? 'border-b-2 border-amber-200' : ''}`}>
                Menu Admin
              </Link>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-4">
             {user ? (
                <div className="flex items-center gap-4 bg-purple-900/50 py-1.5 px-4 rounded-full border border-purple-800">
                   <div className="flex items-center gap-2">
                     <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center border border-purple-400">
                        <User className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-bold font-medium">{user.full_name}</span>
                   </div>
                   <div className="w-px h-4 bg-purple-700"></div>
                   <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-red-300 hover:text-red-200 transition-colors">
                      <LogOut className="w-4 h-4" /> Keluar
                   </button>
                </div>
             ) : (
                <Link href="/auth/login" className="text-sm font-bold bg-white text-purple-800 px-5 py-2 rounded-xl hover:bg-purple-50 transition-colors shadow-sm">
                   Masuk
                </Link>
             )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 md:p-6 flex-1">{children}</main>
      
      <footer className="py-8 border-t border-purple-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">
            @ 2026 | dibuat untuk adik-adik dalam persiapan Tes Retel.
          </p>
          <p className="text-sm text-gray-500 font-medium">
             Jika ada kendala hubungi admin: <a href="https://wa.me/6285256510571" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-bold underline">085256510571 (WA)</a>
          </p>
        </div>
      </footer>
      {user && <ChatWidget user={user} />}
    </div>
  );
}
