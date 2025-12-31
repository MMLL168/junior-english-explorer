import React, { useState, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Mic, MicOff, Sparkles, Coffee, School, Plane } from 'lucide-react';

interface SpeakingDojoProps {
    onEarnXP: () => void;
}

export const SpeakingDojo: React.FC<SpeakingDojoProps> = ({ onEarnXP }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speech = new SpeechRecognition();
      speech.continuous = false;
      speech.interimResults = true;
      speech.lang = 'en-US';

      speech.onstart = () => {
        setIsListening(true);
      };

      speech.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(event.results[i][0].transcript);
            handleSend(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            setTranscript(interimTranscript);
          }
        }
      };

      speech.onend = () => {
        setIsListening(false);
      };

      speech.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      setRecognition(speech);
    } else {
      console.warn("Browser does not support speech recognition.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setTranscript('');
      recognition?.start();
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Slower for clarity
    utterance.pitch = 1.1; // Slightly friendlier pitch
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);

    // Earn XP for speaking
    onEarnXP();

    try {
      const response = await getChatResponse(newMessages, text);
      const aiMessage: ChatMessage = { role: 'model', text: response };
      setMessages([...newMessages, aiMessage]);
      speakText(response);
    } catch (error: any) {
      console.error(error);
      alert(`連線錯誤: ${error.message}\n請檢查 API Key 設定。`);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I can't connect right now. (連線失敗)" }]);
    } finally {
      setIsProcessing(false);
      setTranscript(''); 
    }
  };

  const startScenario = (scenario: string, initialMessage: string) => {
    setMessages([]);
    const startMsg = `Let's role play: ${scenario}. You start first!`;
    setIsProcessing(true);
    // Silent trigger to AI to start the roleplay
    getChatResponse([], startMsg).then(response => {
        setMessages([{ role: 'model', text: response }]);
        speakText(response);
        setIsProcessing(false);
    }).catch(error => {
        alert(`無法開始對話: ${error.message}\n請檢查 API Key 設定。`);
        setIsProcessing(false);
    });
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col py-4">
      
      {/* Visual Feedback Area */}
      <div className="flex-1 w-full flex flex-col space-y-4 p-4 overflow-hidden relative">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-500/30 mb-2 transform rotate-3">
                <Mic size={48} className="text-white" />
            </div>
            
            <div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">English Dojo</h2>
                <p className="text-slate-400">Choose a scenario to start practicing!<br/>選擇一個情境開始練習！</p>
                <p className="text-xs text-blue-400 font-bold mt-2">Reward: 2 💧 / Turn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
                <button onClick={() => startScenario("Ordering Fast Food", "Welcome to Burger King!")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl border border-slate-700 hover:border-brand-yellow transition-all flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform">
                        <Coffee size={24} />
                    </div>
                    <span className="font-bold text-slate-200">Order Food</span>
                    <span className="text-xs text-slate-500">點餐練習</span>
                </button>
                <button onClick={() => startScenario("Meeting a new friend at school", "Hi, is this seat taken?")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl border border-slate-700 hover:border-brand-blue transition-all flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                        <School size={24} />
                    </div>
                    <span className="font-bold text-slate-200">At School</span>
                    <span className="text-xs text-slate-500">校園生活</span>
                </button>
                <button onClick={() => startScenario("Asking for directions", "Excuse me, where is the station?")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl border border-slate-700 hover:border-brand-green transition-all flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
                        <Plane size={24} />
                    </div>
                    <span className="font-bold text-slate-200">Travel</span>
                    <span className="text-xs text-slate-500">旅遊問路</span>
                </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto space-y-6 px-2 pb-20 scroll-smooth">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-5 rounded-3xl text-lg shadow-md leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-pink-600 text-white rounded-tr-none' 
                     : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isListening && transcript && (
                 <div className="flex justify-end animate-pulse">
                    <div className="bg-pink-600/50 text-white/90 p-4 rounded-3xl rounded-tr-none italic border border-pink-500/50">
                        {transcript}...
                    </div>
                 </div>
             )}
             {isProcessing && (
                 <div className="flex justify-start">
                     <div className="bg-slate-700 p-4 rounded-3xl rounded-tl-none flex gap-2 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        <span className="text-xs text-slate-400 ml-2">Teacher is thinking...</span>
                     </div>
                 </div>
             )}
             <div id="scroll-anchor"></div>
          </div>
        )}

      </div>

      {/* Control Area */}
      {messages.length > 0 && (
        <div className="w-full flex flex-col items-center space-y-4 px-4">
            <div className="bg-slate-800/80 backdrop-blur rounded-3xl p-2 border border-slate-700 flex items-center gap-4 pr-6 pl-2 shadow-2xl">
                <button 
                    onClick={toggleListening}
                    disabled={isProcessing || isSpeaking}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all transform ${
                        isListening 
                        ? 'bg-red-500 scale-105 ring-4 ring-red-500/30' 
                        : isProcessing || isSpeaking
                            ? 'bg-slate-600 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-105 hover:shadow-pink-500/50'
                    }`}
                >
                    {isListening ? <MicOff size={28} color="white" /> : <Mic size={28} color="white" />}
                </button>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to Speak"}
                    </span>
                    <span className="text-xs text-slate-400">
                        {isListening ? "請說話..." : "點擊麥克風回答"}
                    </span>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
