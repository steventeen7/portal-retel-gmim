'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, ChevronLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

type Message = {
  id: number;
  from_id: string;
  from_name: string;
  to_id: string | null;
  message: string;
  created_at: string;
};

type OnlineUser = {
  id: string;
  name: string;
};

export default function ChatWidget({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [targetUser, setTargetUser] = useState<OnlineUser | null>(null); // NULL = Ruang Publik
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [isOpen, targetUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const fetchData = async () => {
    try {
      // Ping presence and get online users
      await fetch('/api/presence', { method: 'POST' });
      const presenceRes = await fetch('/api/presence');
      if (presenceRes.ok) {
        const presenceData = await presenceRes.json();
        setOnlineUsers(presenceData.users || []);
      }

      // Get messages (Public or Private)
      const chatUrl = targetUser ? `/api/chat?targetId=${targetUser.id}` : '/api/chat';
      const chatRes = await fetch(chatUrl);
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setMessages(chatData);
      }
    } catch (err) {
      console.error('Failed to fetch chat/presence', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          toId: targetUser?.id || null 
        })
      });
      if (res.ok) {
        setInput('');
        fetchData();
      } else {
        toast.error('Gagal mengirim pesan');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        {onlineUsers.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full text-[10px] font-black flex items-center justify-center">
            {onlineUsers.length - 1}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[360px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl shadow-purple-900/40 border border-purple-100 z-[101] flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white shrink-0 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {targetUser ? (
                <button onClick={() => setTargetUser(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-2 bg-white/20 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                  {targetUser ? targetUser.name : 'Ruang Publik'}
                  {targetUser && <Lock className="w-3 h-3 text-purple-200" />}
                </h3>
                <p className="text-[10px] text-purple-100 font-bold uppercase tracking-widest mt-0.5">
                   {targetUser ? 'Chat Pribadi' : `${onlineUsers.length} Online`}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Online Multi-User Tab (Only in Public Mode) */}
        {!targetUser && onlineUsers.length > 1 && (
           <div className="bg-purple-50/50 px-4 py-3 flex flex-nowrap overflow-x-auto gap-3 shrink-0 border-b border-purple-100 scrollbar-hide">
              {onlineUsers.filter(u => u.id !== user.id).map(u => (
                 <button 
                   key={u.id} 
                   onClick={() => setTargetUser(u)}
                   className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl text-[10px] font-black text-gray-700 border border-purple-100 whitespace-nowrap hover:border-purple-400 hover:scale-105 transition-all shadow-sm group"
                 >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse group-hover:scale-125" />
                    {u.name}
                 </button>
              ))}
           </div>
        )}

        {/* Messages Dashboard */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum ada pesan</p>
                <p className="text-xs text-gray-400 font-medium mt-1">Mulai obrolan seru dengan yang lain!</p>
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
               const isMe = m.from_id === user.id;
               return (
                 <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
                   {!isMe && <span className="text-[10px] font-black text-gray-400 mb-1.5 ml-2 uppercase tracking-tighter">{m.from_name}</span>}
                   <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm transition-all hover:shadow-md ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                     {m.message}
                   </div>
                   <span className="text-[8px] font-black text-gray-300 mt-1.5 mx-2 uppercase">{new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                 </div>
               );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Form */}
        <div className="p-4 bg-white border-t border-gray-50 shrink-0">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full bg-gray-100 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:bg-white focus:border-purple-500 transition-all placeholder:text-gray-400"
                placeholder={targetUser ? `Pesan ke ${targetUser.name}...` : 'Kirim pesan publik...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 hover:bg-purple-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[8px] text-center text-gray-300 font-bold uppercase tracking-[0.2em] mt-3">
             Portal RETEL Diskusi v2.0 • Supabase Sync
          </p>
        </div>
      </div>
    </>
  );
}
