'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatWidget({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;
    
    // Initial fetch
    fetchData();

    // Polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      // Ping presence and get online users
      const presenceRes = await fetch('/api/presence', { method: 'POST' });
      if (presenceRes.ok) {
        const presenceData = await (await fetch('/api/presence')).json();
        setOnlineUsers(presenceData.users || []);
      }

      // Get messages
      const chatRes = await fetch('/api/chat');
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
        body: JSON.stringify({ message: input })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInput('');
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
        className={`fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        {onlineUsers.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] max-h-[500px] bg-white rounded-3xl shadow-2xl shadow-purple-900/20 border border-purple-100 z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-purple-600 p-4 rounded-t-3xl text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Ruang Diskusi
            </h3>
            <p className="text-[10px] text-purple-200 mt-0.5 flex items-center gap-1.5 font-medium">
               <Users className="w-3 h-3" /> {onlineUsers.length} Peserta Online
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Online Status Bar */}
        {onlineUsers.length > 0 && (
           <div className="bg-purple-50 px-4 py-2 flex flex-nowrap overflow-x-auto gap-2 shrink-0 border-b border-purple-100 no-scrollbar">
              {onlineUsers.map(u => (
                 <div key={u.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full text-[9px] font-bold text-gray-600 border border-purple-100 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0 animate-pulse"></span>
                    {u.name}
                    {u.id === user.id && " (Anda)"}
                 </div>
              ))}
           </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 min-h-[250px] max-h-[350px]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
              Belum ada pesan
            </div>
          ) : (
            messages.map((m, i) => {
               const isMe = m.from_id === user.id;
               return (
                 <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                   <span className="text-[9px] font-bold text-gray-400 mb-1 ml-1">{isMe ? 'Anda' : m.from_name}</span>
                   <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'}`}>
                     {m.message}
                   </div>
                   <span className="text-[8px] text-gray-400 mt-1 mr-1">{new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                 </div>
               );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-purple-50 rounded-b-3xl shrink-0 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-purple-300 transition-colors"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="p-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
