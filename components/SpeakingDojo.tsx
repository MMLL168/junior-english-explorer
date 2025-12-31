import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Mic, MicOff, Volume2, Sparkles, MessageCircle } from 'lucide-react';

export const SpeakingDojo: React.FC = () => {
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
      alert("Browser does not support speech recognition. Please use Chrome.");
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
    utterance.rate = 0.9; // Slightly slower for students
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);

    try {
      const response = await getChatResponse(messages, text);
      const aiMessage: ChatMessage = { role: 'model', text: response };
      setMessages([...newMessages, aiMessage]);
      speakText(response);
    } catch (error) {
      console.error(error);
      alert("Oops, connection error!");
    } finally {
      setIsProcessing(false);
      setTranscript(''); // Clear transcript after sending
    }
  };

  const suggestTopic = () => {
    const topics = [
      "What is your favorite animal?",
      "Do you like video games?",
      "What did you eat for breakfast?",
      "Tell me about your best friend.",
      "Do you like summer or winter?"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    speakText(`Let's talk about this: ${randomTopic}`);
    setMessages(prev => [...prev, { role: 'model', text: `Let's talk! ${randomTopic}` }]);
  };

  return (
    <div className="max-w-lg mx-auto h-[calc(100vh-140px)] flex flex-col items-center justify-between py-6">
      
      {/* Visual Feedback Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8 p-4">
        
        {messages.length === 0 ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Mic size={48} className="text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">Speaking Dojo</h2>
            <p className="text-slate-400">Don't be shy! Practice speaking English here.<br/>別害羞！在這裡練習說英文。</p>
            <button 
                onClick={suggestTopic}
                className="mt-4 px-6 py-3 bg-slate-800 rounded-full text-brand-yellow font-bold border border-brand-yellow/30 hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto"
            >
                <Sparkles size={18} />
                <span>Magic Topic (魔法話題)</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto space-y-4 px-2" style={{ maxHeight: '60vh' }}>
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-4 rounded-2xl text-lg ${
                   msg.role === 'user' 
                     ? 'bg-pink-500 text-white rounded-br-none' 
                     : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {/* Transcript overlay while speaking */}
             {isListening && transcript && (
                 <div className="flex justify-end">
                    <div className="bg-pink-500/50 text-white/80 p-4 rounded-2xl rounded-br-none italic">
                        {transcript}...
                    </div>
                 </div>
             )}
             {isProcessing && (
                 <div className="flex justify-start">
                     <div className="bg-slate-700/50 p-4 rounded-2xl rounded-bl-none flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                     </div>
                 </div>
             )}
          </div>
        )}

      </div>

      {/* Control Area */}
      <div className="w-full flex flex-col items-center space-y-4 pb-8">
        {/* Status Text */}
        <div className="h-6 text-sm font-bold text-slate-400">
            {isListening ? "Listening... (聽你在說什麼)" : 
             isProcessing ? "Thinking... (思考中)" : 
             isSpeaking ? "Speaking... (老師說話中)" : 
             "Tap the mic to start (點擊麥克風開始)"}
        </div>

        {/* Main Mic Button */}
        <button 
            onClick={toggleListening}
            disabled={isProcessing || isSpeaking}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform ${
                isListening 
                ? 'bg-red-500 scale-110 ring-4 ring-red-500/30 animate-pulse' 
                : isProcessing || isSpeaking
                    ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-tr from-pink-500 to-rose-400 hover:scale-105 hover:shadow-pink-500/50'
            }`}
        >
            {isListening ? <MicOff size={40} color="white" /> : <Mic size={40} color="white" />}
        </button>
      </div>

    </div>
  );
};