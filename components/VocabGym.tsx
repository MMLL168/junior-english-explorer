import React, { useState, useRef, useEffect } from 'react';
import { generateVocabularyList } from '../services/geminiService';
import { VocabularyWord } from '../types';
import { Loader2, GraduationCap, Volume2, ArrowRight, RefreshCw, Book, Sparkles } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

interface VocabGymProps {
    onEarnXP: (amount: number) => void;
}

type Level = '1000' | '2000' | '3000' | null;

export const VocabGym: React.FC<VocabGymProps> = ({ onEarnXP }) => {
    const [level, setLevel] = useState<Level>(null);
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    
    // Use ref to prevent garbage collection mid-speech
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            utteranceRef.current = null;
        };
    }, []);

    const loadWords = async (selectedLevel: string) => {
        setLoading(true);
        setWords([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionCompleted(false);
        window.speechSynthesis.cancel();

        try {
            const newWords = await generateVocabularyList(selectedLevel);
            setWords(newWords);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
            setLevel(null); // Go back to menu on error
        } finally {
            setLoading(false);
        }
    };

    const handleLevelSelect = (lvl: Level) => {
        if (!lvl) return;
        setLevel(lvl);
        loadWords(lvl);
    };

    const playAudio = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        
        utteranceRef.current = utterance;
        utterance.onend = () => { utteranceRef.current = null; };
        utterance.onerror = () => { utteranceRef.current = null; };
        
        window.speechSynthesis.speak(utterance);
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished the set
            setSessionCompleted(true);
            onEarnXP(1); // Earn 1 drop for completing 5 words
            canvasConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD200', '#F472B6']
            });
        }
    };

    const handleBackToMenu = () => {
        setLevel(null);
        setWords([]);
        setSessionCompleted(false);
        window.speechSynthesis.cancel();
    };

    // --- View: Level Selection ---
    if (!level) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-fade-in">
                <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full mx-auto flex items-center justify-center mb-4 text-indigo-400">
                        <GraduationCap size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Vocab Gym</h2>
                    <h3 className="text-lg font-bold text-indigo-400 mb-2">單字健身房</h3>
                    <p className="text-slate-400 text-sm">Choose your level to start training!<br/>選擇你的等級開始訓練！</p>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-md px-4">
                    <button 
                        onClick={() => handleLevelSelect('1000')}
                        className="bg-slate-800 hover:bg-emerald-900/30 border-2 border-emerald-500/50 hover:border-emerald-500 p-6 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 text-slate-900 font-bold w-10 h-10 rounded-full flex items-center justify-center">1</div>
                            <div className="text-left">
                                <h4 className="text-white font-bold text-lg">Basic 1000</h4>
                                <p className="text-emerald-400 text-xs">國小必備單字 (Foundation)</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    <button 
                        onClick={() => handleLevelSelect('2000')}
                        className="bg-slate-800 hover:bg-blue-900/30 border-2 border-blue-500/50 hover:border-blue-500 p-6 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">2</div>
                            <div className="text-left">
                                <h4 className="text-white font-bold text-lg">Intermediate 2000</h4>
                                <p className="text-blue-400 text-xs">國中常用單字 (Core)</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <button 
                        onClick={() => handleLevelSelect('3000')}
                        className="bg-slate-800 hover:bg-purple-900/30 border-2 border-purple-500/50 hover:border-purple-500 p-6 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">3</div>
                            <div className="text-left">
                                <h4 className="text-white font-bold text-lg">Advanced 3000</h4>
                                <p className="text-purple-400 text-xs">挑戰進階單字 (Challenge)</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-500 group-hover:text-purple-500 transition-colors" />
                    </button>
                </div>
            </div>
        );
    }

    // --- View: Loading ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-400 mb-4" size={48} />
                <p className="font-display text-xl text-slate-300 animate-pulse font-bold">Finding useful words...</p>
                <p className="text-slate-500">正在搜尋適合的單字...</p>
            </div>
        );
    }

    // --- View: Completed ---
    if (sessionCompleted) {
        return (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center px-4">
                <div className="w-24 h-24 bg-brand-yellow/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Sparkles size={48} className="text-brand-yellow" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Great Job!</h2>
                <h3 className="text-lg text-slate-400 mb-6">You practiced 5 words! (完成 5 個單字)</h3>
                
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button 
                        onClick={() => loadWords(level)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-1"
                    >
                        <RefreshCw size={20} /> Practice 5 More
                    </button>
                    <button 
                        onClick={handleBackToMenu}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 py-4 rounded-xl font-bold transition-colors"
                    >
                        Back to Levels (選單)
                    </button>
                </div>
            </div>
        );
    }

    // --- View: Flashcard ---
    const currentWord = words[currentIndex];

    return (
        <div className="max-w-md mx-auto py-4 px-4 h-[calc(100vh-160px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handleBackToMenu} className="text-slate-400 text-sm hover:text-white">← Back</button>
                <div className="text-indigo-400 font-bold text-sm">Word {currentIndex + 1} / {words.length}</div>
            </div>

            {/* Card Container */}
            <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 relative cursor-pointer group perspective-1000"
            >
                <div className={`w-full h-full transition-all duration-500 preserve-3d relative rounded-3xl shadow-xl border-2 ${isFlipped ? 'bg-slate-800 border-indigo-500/50' : 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500'} flex flex-col items-center justify-center p-8 text-center`}>
                    
                    {!isFlipped ? (
                        // Front Side
                        <div className="animate-fade-in flex flex-col items-center gap-6">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest bg-indigo-900/50 px-3 py-1 rounded-full">Tap to Flip</span>
                            <h2 className="text-5xl font-display font-bold text-white mb-2">{currentWord.word}</h2>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl">
                                <span className="text-slate-400 font-mono">/{currentWord.pronunciation}/</span>
                                <button 
                                    onClick={(e) => playAudio(e, currentWord.word)}
                                    className="bg-indigo-500 hover:bg-indigo-400 text-white p-2 rounded-full transition-colors shadow-lg"
                                >
                                    <Volume2 size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Back Side
                        <div className="animate-fade-in flex flex-col items-center w-full">
                             <div className="flex items-center gap-2 mb-6">
                                <h3 className="text-3xl font-bold text-white">{currentWord.word}</h3>
                                <button 
                                    onClick={(e) => playAudio(e, currentWord.word)}
                                    className="text-indigo-400 hover:text-white"
                                >
                                    <Volume2 size={20} />
                                </button>
                             </div>

                             <div className="bg-slate-900/50 p-4 rounded-xl w-full mb-4 border border-slate-700">
                                <p className="text-2xl font-bold text-brand-yellow mb-1">{currentWord.chineseDefinition}</p>
                                <p className="text-slate-400 italic text-sm">{currentWord.definition}</p>
                             </div>

                             <div className="text-left w-full space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase">Example:</p>
                                <p className="text-white text-lg leading-snug">"{currentWord.exampleSentence}"</p>
                                <p className="text-slate-400 text-sm border-l-2 border-indigo-500 pl-2">{currentWord.chineseExample}</p>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isFlipped) setIsFlipped(true); // Flip first if not flipped
                        else handleNext(); // Next if already flipped
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all"
                >
                    {isFlipped ? (currentIndex === words.length - 1 ? "Finish Set" : "Next Word →") : "See Meaning (看解釋)"}
                </button>
            </div>
        </div>
    );
};
