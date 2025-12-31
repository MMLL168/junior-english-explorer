import React, { useState, useRef, useEffect } from 'react';
import { correctSentence } from '../services/geminiService';
import { Send, User, Bot, Sparkles, PenTool, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../types';
import canvasConfetti from 'canvas-confetti';

export const WritingLab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your Writing Assistant. \n你好！我是你的寫作小幫手。\n\nTry writing a sentence, and I'll help you check it! \n試著寫一個英文句子，我會幫你檢查喔！\n\nExample: 'I go to school yesterday.'" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestionTopics = [
    "My favorite food is...",
    "I like to play...",
    "Last weekend, I...",
    "My dream house has...",
    "If I were a superhero...",
    "My pet is..."
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Trigger confetti for effort
    canvasConfetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#B589D6', '#FFD200'] // Purple and Yellow
    });

    try {
        const response = await correctSentence(userMsg.text);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e: any) {
        setMessages(prev => [...prev, { role: 'model', text: `Sorry, something went wrong! (${e.message}) \n請檢查 API Key 設定。` }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-slate-800 rounded-3xl shadow-xl shadow-black/20 overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-brand-purple/10 p-4 border-b border-brand-purple/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-white mr-3">
                    <PenTool size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">Writing Lab 寫作練習室</h3>
                    <p className="text-xs text-slate-400">AI Teacher will fix your grammar! 讓 AI 老師幫你改作文！</p>
                </div>
            </div>
            
            {/* Topic Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex items-center text-brand-purple text-xs font-bold mr-1 whitespace-nowrap">
                    <Lightbulb size={14} className="mr-1" /> Try:
                </div>
                {suggestionTopics.map((topic, idx) => (
                    <button
                        key={idx}
                        onClick={() => setInput(topic)}
                        className="bg-slate-700 hover:bg-brand-purple hover:text-white text-slate-300 text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap border border-slate-600"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-md ${
                        msg.role === 'user' 
                        ? 'bg-brand-purple text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
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
                    <div className="bg-slate-700 rounded-2xl p-4 rounded-tl-none flex items-center space-x-2 border border-slate-600">
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
                    className="absolute right-2 p-2 bg-brand-purple text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-brand-purple transition-colors shadow-lg"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};
