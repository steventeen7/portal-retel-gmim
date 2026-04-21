'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatWidget from './ChatWidget';

export default function Layout({ children, user }: { children: React.ReactNode, user?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Global Presence Tracking
  useEffect(() => {
    if (!user) return;
    
    const ping = () => fetch('/api/presence', { method: 'POST' }).catch(() => {});
    ping(); // Initial ping
    
    const interval = setInterval(ping, 20000); // Ping every 20s
    return () => clearInterval(interval);
  }, [user]);

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
        <div className="container mx-auto px-6">
          {/* Top Bar / Logo Row */}
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-black tracking-tight shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
               <ShieldCheck className="w-6 h-6 text-purple-300" />
               <span className="hidden sm:inline">Latihan RETEL GMIM</span>
               <span className="sm:hidden">Latihan RETEL</span>
            </Link>

            {/* Hamburger Toggle (Mobile Only) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-purple-700 rounded-lg transition-colors focus:outline-none"
            >
              {isMenuOpen ? <LogOut className="w-6 h-6 rotate-90" /> : <ShieldCheck className="w-6 h-6" />}
              {/* Note: I'll use simple icons if menu/x are not imported, but Lucide has Menu/X. 
                  Wait, I should import Menu and X. Let's update imports too. */}
            </button>
            
            {/* Desktop User / Auth (Hidden on Mobile) */}
            <div className="hidden md:flex shrink-0 items-center gap-4">
               {user ? (
                  <div className="flex items-center gap-4 bg-purple-900/50 py-1.5 px-4 rounded-full border border-purple-800">
                     <Link href="/profile" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
                       <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center border border-purple-400">
                          <User className="w-4 h-4" />
                       </div>
                       <span className="text-xs font-bold">{user.full_name}</span>
                     </Link>
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

          {/* Navigation & Mobile Menu (Collapsible) */}
          <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center pb-4 md:pb-0 gap-4 md:gap-10 border-t border-purple-700 md:border-none pt-4 md:pt-0`}>
             <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-medium text-sm">
               {menu.map(item => (
                 <Link 
                   key={item.href} 
                   href={item.href} 
                   onClick={() => setIsMenuOpen(false)}
                   className={`hover:text-purple-200 transition-colors w-full md:w-auto text-center py-2 md:py-0 ${pathname === item.href ? 'text-purple-200 font-bold border-b-2 border-purple-200' : 'text-purple-100'}`}
                 >
                   {item.label}
                 </Link>
               ))}
               {user?.role === 'admin' && (
                 <Link 
                   href="/admin" 
                   onClick={() => setIsMenuOpen(false)}
                   className={`hover:text-amber-200 transition-colors text-amber-100 font-bold w-full md:w-auto text-center py-2 md:py-0 ${pathname.startsWith('/admin') ? 'border-b-2 border-amber-200' : ''}`}
                 >
                   Menu Admin
                 </Link>
               )}
             </div>

             {/* Mobile User / Auth (Shown only when menu is open) */}
             <div className="md:hidden flex flex-col gap-3 pt-4 border-t border-purple-700">
                {user ? (
                   <>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 py-3 bg-purple-900/50 rounded-2xl">
                         <User className="w-5 h-5" />
                         <span className="font-bold">{user.full_name}</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3 text-red-300 font-bold border border-red-900/50 rounded-2xl">
                         <LogOut className="w-5 h-5" /> Keluar
                      </button>
                   </>
                ) : (
                   <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 bg-white text-purple-800 font-bold rounded-2xl">
                      Masuk
                   </Link>
                )}
             </div>
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
