import React, { useState } from 'react';
import { generateListeningChallenge } from '../services/geminiService';
import { ListeningChallenge } from '../types';
import { Headphones, PlayCircle, StopCircle, Eye, EyeOff, Loader2, Volume2, FastForward, CheckCircle2, XCircle } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

export const ListeningLab: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [challenge, setChallenge] = useState<ListeningChallenge | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showScript, setShowScript] = useState(false);
    const [isSlowMode, setIsSlowMode] = useState(false);
    
    // Quiz state
    const [answers, setAnswers] = useState<{[key: number]: number}>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setChallenge(null);
        setAnswers({});
        setIsSubmitted(false);
        setShowScript(false);
        
        try {
            const result = await generateListeningChallenge(topic);
            setChallenge(result);
        } catch (e: any) {
            alert(`⚠️ Error:\n${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else if (challenge) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(challenge.script);
            utterance.lang = 'en-US';
            utterance.rate = isSlowMode ? 0.75 : 0.95; 
            
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleAnswer = (qId: number, optionIdx: number) => {
        if(isSubmitted) return;
        setAnswers(prev => ({...prev, [qId]: optionIdx}));
    };

    const submitQuiz = () => {
        setIsSubmitted(true);
        setShowScript(true); // Reveal script after submitting
        
        // Calculate score
        if(!challenge) return;
        let correctCount = 0;
        challenge.questions.forEach(q => {
            if(answers[q.id] === q.correctAnswerIndex) correctCount++;
        });

        if(correctCount === challenge.questions.length) {
            canvasConfetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#20E3B2', '#4FACFE']
            });
        }
    };

    if (!challenge && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-fade-in">
                <div className="bg-slate-800 p-8 rounded-3xl shadow-xl shadow-black/20 text-center w-full max-w-md border-b-8 border-brand-teal ring-1 ring-slate-700">
                    <div className="w-20 h-20 bg-brand-teal/20 rounded-full mx-auto flex items-center justify-center mb-4 text-brand-teal">
                        <Headphones size={40} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-1">Listening Lab</h2>
                    <h3 className="text-lg font-bold text-brand-teal mb-2">聽力實驗室</h3>
                    <p className="text-slate-400 mb-6 text-sm">
                        Train your ears! Listen to a story and answer questions.<br/>
                        <span className="text-xs text-slate-500">訓練耳朵！輸入主題來練習聽力。</span>
                    </p>
                    
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Topic (e.g., Shopping, Hobbies)..."
                        className="w-full p-4 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-brand-teal focus:ring-2 focus:ring-teal-900/50 outline-none transition-all text-lg mb-4 text-white placeholder-slate-500"
                    />
                    
                    <button
                        onClick={handleGenerate}
                        disabled={!topic.trim()}
                        className="w-full bg-brand-teal text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex flex-col items-center justify-center leading-tight"
                    >
                        <span>Start Listening</span>
                        <span className="text-xs opacity-70 font-normal">開始聽力練習</span>
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-brand-teal mb-4" size={48} />
                <p className="font-display text-xl text-slate-300 animate-pulse font-bold">Creating audio script...</p>
                <p className="text-slate-500">正在製作聽力內容...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
            {/* Audio Player Card */}
            <div className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
                <div className="flex flex-col items-center text-center space-y-4 z-10 relative">
                    <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Listening Comprehension</h3>
                    <h2 className="text-2xl font-display font-bold text-white">{challenge?.topic}</h2>
                    
                    <div className="bg-slate-900/50 p-6 rounded-2xl w-full border border-slate-600 flex flex-col items-center gap-4">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isPlaying ? 'bg-brand-teal shadow-[0_0_30px_rgba(32,227,178,0.4)] scale-110' : 'bg-slate-700'}`}>
                             <Volume2 size={48} className={isPlaying ? 'text-slate-900 animate-pulse' : 'text-slate-400'} />
                        </div>
                        
                        <div className="flex gap-4 w-full justify-center mt-2">
                             <button 
                                onClick={togglePlay}
                                className={`flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-brand-teal text-slate-900 hover:bg-teal-400 shadow-lg shadow-brand-teal/20'}`}
                             >
                                {isPlaying ? <StopCircle size={20}/> : <PlayCircle size={20}/>}
                                {isPlaying ? 'Stop' : 'Listen Now'}
                             </button>
                             
                             <button
                                onClick={() => setIsSlowMode(!isSlowMode)}
                                className={`px-4 py-3 rounded-xl font-bold border transition-all flex items-center gap-1 ${isSlowMode ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-400'}`}
                                title="Toggle Slow Speed"
                             >
                                <span className="text-xs">{isSlowMode ? 'Slow (0.75x)' : 'Normal (1.0x)'}</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-lg px-2">
                    <span className="bg-brand-teal text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">?</span>
                    Answer these questions
                </div>
                
                {challenge?.questions.map((q) => (
                    <div key={q.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-white text-lg font-medium mb-4">{q.question}</h4>
                        <div className="space-y-2">
                            {q.options.map((opt, idx) => {
                                let btnClass = "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700";
                                // Logic for showing results
                                if (isSubmitted) {
                                    if (idx === q.correctAnswerIndex) {
                                        btnClass = "bg-green-900/40 border-green-500 text-green-400 font-bold";
                                    } else if (idx === answers[q.id]) {
                                        btnClass = "bg-red-900/40 border-red-500 text-red-400 line-through opacity-70";
                                    } else {
                                        btnClass = "opacity-40 grayscale";
                                    }
                                } else if (answers[q.id] === idx) {
                                    btnClass = "bg-brand-teal/20 border-brand-teal text-brand-teal font-bold ring-1 ring-brand-teal";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(q.id, idx)}
                                        disabled={isSubmitted}
                                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${btnClass}`}
                                    >
                                        <span>{opt}</span>
                                        {isSubmitted && idx === q.correctAnswerIndex && <CheckCircle2 size={18}/>}
                                        {isSubmitted && idx === answers[q.id] && idx !== q.correctAnswerIndex && <XCircle size={18}/>}
                                    </button>
                                )
                            })}
                        </div>
                        
                        {isSubmitted && (
                             <div className="mt-3 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <span className="text-brand-teal font-bold mr-2">解析:</span>
                                {q.explanation}
                             </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions & Script Reveal */}
            <div className="flex flex-col gap-4 pb-10">
                {!isSubmitted && (
                    <button 
                        onClick={submitQuiz}
                        disabled={Object.keys(answers).length < (challenge?.questions.length || 0)}
                        className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-brand-blue/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        Submit Answers (送出答案)
                    </button>
                )}

                {isSubmitted && (
                    <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 animate-fade-in">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="bg-slate-700 p-1.5 rounded-lg"><FastForward size={16}/></span>
                                Transcript (聽力稿)
                             </h3>
                         </div>
                         <div className="prose prose-invert prose-p:text-slate-300 max-w-none leading-loose p-4 bg-slate-900 rounded-xl border border-slate-800">
                            {challenge?.script}
                         </div>
                         <button 
                             onClick={() => { setTopic(''); setChallenge(null); window.speechSynthesis.cancel(); }}
                             className="w-full mt-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                         >
                            Try Another Topic (練習下一個)
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};
