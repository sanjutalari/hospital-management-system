import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  AlertCircle, 
  RefreshCcw, 
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { aiService } from '../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Medical Assistant. I can help you understand your symptoms and suggest potential next steps. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.analyze(input);
      const { analysis, disclaimer } = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on what you've described, this might be related to **${analysis.diagnosis}**.`,
        analysis,
        disclaimer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.response?.data?.error || "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden backdrop-blur-sm bg-white/80">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
            <Sparkles size={20} className="text-blue-100" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">AI Health Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Powered by HMS Intelligence</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowDisclaimer(true)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          title="Important Disclaimer"
        >
          <Info size={18} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white text-blue-600 border border-slate-200"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
              </div>
              <div className="space-y-2">
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm shadow-sm",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                )}>
                  {msg.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                  )}
                  
                  {msg.analysis && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 bg-blue-50 rounded text-blue-600 mt-0.5">
                          <Stethoscope size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suggested Care</p>
                          <p className="text-slate-600 leading-relaxed text-[13px]">{msg.analysis.advice}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</p>
                          <p className={cn(
                            "text-xs font-bold mt-0.5",
                            msg.analysis.riskLevel === 'Low' ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {msg.analysis.riskLevel}
                          </p>
                        </div>
                        <div className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">{msg.analysis.specialist}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.disclaimer && (
                    <div className="mt-4 p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-2.5">
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 italic leading-snug">
                        {msg.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 px-1 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 border border-slate-200 flex items-center justify-center shadow-sm">
              <Bot size={16} />
            </div>
            <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">Analysing symptoms...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptoms (e.g., headache, fever for 2 days)..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center",
              !input.trim() || isLoading 
                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-amber-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Medical Disclaimer</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              This assistant is for informational purposes only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              I Understand
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
