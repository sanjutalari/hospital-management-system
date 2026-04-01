import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/api';

export const ChatBox = ({ partner, socket, online }) => {
  const { user }             = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const endRef                  = useRef(null);
  const typingTimer             = useRef(null);

  useEffect(() => {
    if (!partner?.id) return;
    setLoading(true);
    chatService.history(partner.id)
      .then(r => { setMessages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [partner?.id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (msg) => {
      if (msg.senderId === partner?.id || msg.receiverId === partner?.id) {
        setMessages(prev => [...prev, msg]);
        socket.emit('mark_read', { senderId: partner.id });
      }
    });

    socket.on('message_sent', (msg) => {
      setMessages(prev => prev.map(m => m._temp && m.content === msg.content ? msg : m));
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === partner?.id) setTyping(true);
    });
    socket.on('stopped_typing', ({ senderId }) => {
      if (senderId === partner?.id) setTyping(false);
    });

    return () => {
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('typing');
      socket.off('stopped_typing');
    };
  }, [socket, partner?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    const tempMsg = {
      _temp: true, id: `temp-${Date.now()}`,
      senderId: user.id, receiverId: partner.id,
      content: input.trim(), sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    socket.emit('send_message', { receiverId: partner.id, content: input.trim() });
    socket.emit('typing_stop', { receiverId: partner.id });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing_start', { receiverId: partner.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => socket.emit('typing_stop', { receiverId: partner.id }), 1500
    );
  };

  if (!partner) return (
    <div className="flex-1 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="text-5xl mb-3">💬</div>
        <p className="font-medium">Select a conversation to start chatting</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-white">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {partner.name?.charAt(0)}
          </div>
          {online[partner.id] && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800">{partner.name}</p>
          <p className="text-xs text-slate-400">{online[partner.id] ? '● Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-slate-50">
        {loading && <p className="text-center text-slate-400 text-sm">Loading messages…</p>}
        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMine
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 shadow-sm rounded-bl-sm border border-slate-100'
              } ${msg._temp ? 'opacity-60' : ''}`}>
                {msg.content}
                <span className={`block text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg._temp && ' · sending…'}
                </span>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-sm border border-slate-100 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3.5 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
