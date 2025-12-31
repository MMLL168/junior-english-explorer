import React, { useState, useRef, useEffect } from 'react';
import { correctSentence } from '../services/geminiService';
import { Send, User, Bot, Sparkles, PenTool } from 'lucide-react';
import { ChatMessage } from '../types';

export const WritingLab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your Writing Assistant. \n你好！我是你的寫作小幫手。\n\nTry writing a sentence, and I'll help you check it! \n試著寫一個英文句子，我會幫你檢查喔！\n\nExample: 'I go to school yesterday.'" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const response = await correctSentence(userMsg.text);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost my internet connection! (抱歉，網路連線中斷了)" }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-slate-800 rounded-3xl shadow-xl shadow-black/20 overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-brand-purple/10 p-4 border-b border-brand-purple/20 flex items-center">
            <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-white mr-3">
                <PenTool size={20} />
            </div>
            <div>
                <h3 className="font-bold text-white">Writing Lab 寫作練習室</h3>
                <p className="text-xs text-slate-400">Practice your sentences here! 在這裡練習造句！</p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                        ? 'bg-brand-purple text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-100 rounded-tl-none'
                    }`}>
                         <div className="flex items-center gap-2 mb-1 opacity-75 text-xs font-bold uppercase tracking-wider">
                             {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                             {msg.role === 'user' ? 'You' : 'Teacher AI'}
                         </div>
                         <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl p-4 rounded-tl-none flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a sentence here... (輸入英文句子)"
                    className="w-full pl-5 pr-14 py-4 rounded-full border-2 border-slate-700 bg-slate-800 focus:border-brand-purple focus:ring-2 focus:ring-purple-900/50 outline-none shadow-sm text-lg transition-all text-white placeholder-slate-500"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 p-2 bg-brand-purple text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-brand-purple transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};
