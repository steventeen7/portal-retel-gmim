'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, CheckCircle, XCircle, Shield, 
  Settings, Search, Filter, History, 
  ClipboardList, Mic, Key, Trophy,
  Save, RefreshCw, Trash2, LayoutDashboard,
  MessageSquare, ArrowRight, X
} from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_approved: boolean;
  permissions: string[];
  jemaat: string;
  wilayah?: string;
  rayon: string;
  phone?: string;
  created_at: string;
};

export default function AdminClient({ initialUsers, initialLogs, initialChatLogs }: { initialUsers: UserProfile[], initialLogs: any[], initialChatLogs: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'chats' | 'activity'>('users');
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [logs] = useState(initialLogs);
  const [chatLogs] = useState(initialChatLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    jemaat: '',
    wilayah: '',
    rayon: '',
    phone: '',
    role: 'user'
  });
  const [importData, setImportData] = useState('');
  const [importType, setImportType] = useState('soal_tes');

  const modules = [
    { id: 'tes', label: 'Tes Tertulis', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'wawancara', label: 'Wawancara', icon: <Mic className="w-4 h-4" /> },
    { id: 'keyword', label: 'Kata Kunci', icon: <Key className="w-4 h-4" /> },
    { id: 'tiga-besar', label: '3 Besar', icon: <Trophy className="w-4 h-4" /> },
  ];

  async function handleUpdate(user: UserProfile) {
    setLoadingId(user.id);
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          permissions: user.permissions,
          isApproved: user.is_approved,
          full_name: user.full_name, // Fix: Kirim full_name agar Log tidak error
          email: user.email,
          jemaat: user.jemaat,
          wilayah: user.wilayah,
          rayon: user.rayon,
          phone: user.phone,
          role: user.role
        }),
      });
      
      if (!res.ok) throw new Error('Gagal memperbarui');
      toast.success(`Data ${user.full_name} berhasil diperbarui!`);
      setShowEdit(false);
    } catch (err) {
      toast.error('Gagal menyimpan perubahan.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Gagal menghapus akun');
      }
      toast.success('Akun berhasil dihapus');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name,
      email: u.email || '',
      jemaat: u.jemaat || '',
      wilayah: u.wilayah || '',
      rayon: u.rayon || '',
      phone: u.phone || '',
      role: u.role || 'user'
    });
    setShowEdit(true);
  };

  const filteredUsers = users.filter(u => 
    (u?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u?.jemaat || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header with Dashboard Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[40px] border border-purple-100 shadow-xl shadow-purple-900/5">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel Administrator</h1>
          <p className="text-gray-500 font-medium">Kelola peserta, perizinan modul, dan pantau aktivitas sistem.</p>
        </div>
        <div className="flex items-center gap-3">
           <a href="/dashboard" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2 group">
              <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Ke Dashboard User
           </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
         {[
           { id: 'users', label: 'Peserta', icon: <Users className="w-4 h-4" /> },
           { id: 'chats', label: 'Log Chat', icon: <MessageSquare className="w-4 h-4" /> },
           { id: 'activity', label: 'Aktivitas', icon: <History className="w-4 h-4" /> },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
               activeTab === tab.id 
               ? 'bg-white text-purple-600 shadow-md' 
               : 'text-gray-400 hover:text-gray-600'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      {/* Modal Import (Sangat Berguna untuk input soal masal dari G:\) */}
      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
             <div className="bg-purple-600 p-8 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black tracking-tight">Import Data Soal</h3>
                   <p className="text-purple-100 text-xs font-medium">Tempel data dari file lokal (G:\Drive) Anda ke sini.</p>
                </div>
                <button onClick={() => setShowImport(false)} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
             </div>
             <div className="p-8 space-y-6">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Tipe Data</label>
                   <select 
                     value={importType} 
                     onChange={(e) => setImportType(e.target.value)}
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 focus:border-purple-500 outline-none"
                   >
                      <option value="soal_tes">Soal Tes Tertulis (CSV/JSON)</option>
                      <option value="soal_wawancara">Soal Wawancara</option>
                      <option value="kata_kunci">Kata Kunci</option>
                      <option value="soal_tiga_besar">Soal 3 Besar</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Data Dump (JSON)</label>
                   <textarea 
                     className="w-full h-48 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-mono text-xs focus:border-purple-500 outline-none"
                     placeholder='[{"tahun": 2025, "nomor_soal": 1, "teks_soal": "...", "jawaban_benar": "A"}]'
                     value={importData}
                     onChange={(e) => setImportData(e.target.value)}
                   />
                </div>
                <button 
                  onClick={() => { toast.success('Data siap diupload! (Mock)'); setShowImport(false); }}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all"
                >
                   Konfirmasi & Upload ke Supabase
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Areas based on Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[24px] shadow-sm border border-purple-50">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari nama, email, atau jemaat..."
                className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowImport(true)} className="btn bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-100 shadow-sm">
                  <ClipboardList className="w-3.5 h-3.5" /> Import Data
              </button>
              <button onClick={() => window.location.reload()} className="btn bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[32px] border border-purple-50 shadow-xl shadow-purple-900/5 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50 border-b border-purple-100">
                  <th className="px-6 py-5 text-[10px] font-black text-purple-400 uppercase tracking-widest">Informasi Peserta</th>
                  <th className="px-6 py-5 text-[10px] font-black text-purple-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-purple-400 uppercase tracking-widest">Izin Modul</th>
                  <th className="px-6 py-5 text-[10px] font-black text-purple-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-6 py-6 font-medium">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-black text-lg shadow-sm">
                          {(u?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">{u?.full_name || 'Tanpa Nama'}</div>
                          <div className="text-gray-400 text-xs font-medium">{u?.email || 'N/A'}</div>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold uppercase tracking-tighter">{u.jemaat}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold uppercase tracking-tighter">{u.wilayah}</span>
                            {u.phone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-bold uppercase tracking-tighter">WA: {u.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => setUsers(prev => prev.map(p => p.id === u.id ? { ...p, is_approved: !p.is_approved } : p))}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          u.is_approved 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {u.is_approved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.is_approved ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-2">
                        {modules.map(mod => (
                          <label key={mod.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                            u.permissions?.includes(mod.id)
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'
                          }`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={u.permissions?.includes(mod.id)}
                              onChange={(e) => {
                                const newPerms = e.target.checked 
                                  ? [...(u.permissions || []), mod.id]
                                  : (u.permissions || []).filter(p => p !== mod.id);
                                setUsers(prev => prev.map(p => p.id === u.id ? { ...p, permissions: newPerms } : p));
                              }}
                            />
                            {mod.icon}
                            <span className="text-[10px] font-black uppercase tracking-tighter">{mod.label}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Edit Profil">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} disabled={loadingId === u.id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50" title="Hapus Akun">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdate(u)}
                        disabled={loadingId === u.id}
                        className="btn-primary py-2 px-4 text-xs h-10 shadow-purple-500/10 active:scale-95 disabled:opacity-50"
                      >
                        {loadingId === u.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chats Log Tab */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-[40px] border border-purple-100 shadow-xl shadow-purple-900/5 overflow-hidden">
           <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" /> Diskusi & Log Chat
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{chatLogs.length} Pesan Tercatat</span>
           </div>
           <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
              {chatLogs.map((chat, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-3xl border border-gray-100 hover:bg-purple-50/30 transition-all group">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-white ${chat.to_id ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-purple-600 shadow-lg shadow-purple-500/20'}`}>
                      {chat.to_id ? 'P' : 'G'}
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 text-sm">{chat.sender?.full_name || chat.from_name}</span>
                            {chat.to_id && (
                              <>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <span className="font-black text-indigo-600 text-sm">{chat.recipient?.full_name || 'Penerima'}</span>
                              </>
                            )}
                         </div>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(chat.created_at).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-50 italic">"{chat.message}"</p>
                   </div>
                </div>
              ))}
              {chatLogs.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada sejarah chat</div>
              )}
           </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 overflow-hidden max-h-[600px] overflow-y-auto space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50 group hover:border-purple-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                  <div>
                    <div className="text-sm font-bold text-gray-800 tracking-tight">
                        {log.profiles?.full_name || 'System'}: <span className="text-purple-600">{log.activity}</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] p-8 text-white h-fit">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-500" /> Sistem Audit
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Keamanan</div>
                    <div className="text-emerald-400 font-black flex items-center gap-2">
                       <CheckCircle className="w-4 h-4" /> Secure (Supabase RLS Active)
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Peserta</div>
                    <div className="text-gray-100 font-black text-2xl">{users.length}</div>
                 </div>
              </div>
          </div>
        </div>
      )}

        <div className="space-y-4">
           <div className="flex items-center gap-2 px-1">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Sistem Control</h2>
          </div>
          <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[32px] p-8 text-white shadow-xl shadow-purple-900/20 space-y-6">
             <div>
                <div className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-1">Status Server</div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <div className="text-lg font-black tracking-tight tracking-tight uppercase">Mode: {process.env.NEXT_PUBLIC_DB_MODE || 'SUPABASE'}</div>
                </div>
             </div>
             <div className="pt-6 border-t border-white/10">
                <p className="text-purple-200 text-xs font-medium leading-relaxed">
                   Admin bertanggung jawab penuh atas persetujuan pendaftar. Pastikan data Jemaat & Wilayah valid sebelum memberikan izin akses modul latihan.
                </p>
             </div>
             <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-sm transition-all uppercase tracking-widest">
                Download Rekapitulasi
             </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEdit && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl animate-scale-in overflow-hidden">
             <div className="bg-purple-600 px-8 py-6 flex items-center justify-between text-white">
                <h3 className="text-xl font-black uppercase tracking-widest">Edit Profil Peserta</h3>
                <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
             </div>
             <div className="p-8 grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                   <input 
                     type="text" 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.full_name}
                     onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                   <input 
                     type="email" 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.email}
                     onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jemaat</label>
                   <input 
                     type="text" 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.jemaat}
                     onChange={(e) => setEditForm({...editForm, jemaat: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Wilayah</label>
                   <input 
                     type="text" 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.wilayah}
                     onChange={(e) => setEditForm({...editForm, wilayah: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Rayon</label>
                   <input 
                     type="text" 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.rayon}
                     onChange={(e) => setEditForm({...editForm, rayon: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Role</label>
                   <select 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={editForm.role}
                     onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                   >
                      <option value="user">User / Peserta</option>
                      <option value="admin">Administrator</option>
                   </select>
                </div>
                <div className="col-span-2 pt-4">
                   <button 
                     onClick={() => {
                       const updated = { ...editingUser, ...editForm };
                       handleUpdate(updated);
                       setUsers(prev => prev.map(p => p.id === updated.id ? updated : p));
                     }}
                     disabled={loadingId === editingUser.id}
                     className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                   >
                     {loadingId === editingUser.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     Simpan Perubahan Data
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
