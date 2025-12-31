import React, { useState } from 'react';
import { generateStory } from '../services/geminiService';
import { StoryResponse, VocabularyWord } from '../types';
import { Sparkles, BookOpen, Volume2, PlayCircle, StopCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface StoryModeProps {
    onEarnXP: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ onEarnXP }) => {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setStory(null);
    setSelectedWord(null);
    setHasClaimedReward(false);
    try {
      const result = await generateStory(topic);
      setStory(result);
    } catch (e: any) {
      alert(`⚠️ 發生錯誤 (Error):\n${e.message}\n\n請檢查 API Key 設定。`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = () => {
      if (!hasClaimedReward) {
          onEarnXP();
          setHasClaimedReward(true);
      }
  };

  const speakText = (text: string, isFullStory: boolean = false) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = isFullStory ? 0.85 : 0.9; // Slower for story reading
    
    if (isFullStory) {
        setIsPlayingStory(true);
        utterance.onend = () => {
             setIsPlayingStory(false);
             // Auto claim reward after listening? Maybe optional.
        };
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlayingStory(false);
  };

  if (!story && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-fade-in">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-xl shadow-black/20 text-center w-full max-w-md border-b-8 border-brand-orange ring-1 ring-slate-700">
          <div className="w-20 h-20 bg-brand-orange/20 rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpen className="text-brand-orange" size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Story Time!</h2>
          <h3 className="text-lg font-bold text-brand-orange mb-2">英語故事時間</h3>
          <p className="text-slate-400 mb-6 text-sm md:text-base">
            What do you want to read about? <br/>
            <span className="text-xs text-slate-500">想讀什麼故事？例如：Dragons (龍), Space (太空)</span>
            <br/><span className="text-xs text-blue-400 font-bold mt-2 block">Reward: 5 💧 / Story</span>
          </p>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., A funny monkey... (輸入主題)"
            className="w-full p-4 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-orange-900/50 outline-none transition-all text-lg mb-4 text-white placeholder-slate-500"
          />
          
          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex flex-col items-center justify-center leading-tight"
          >
            <span>Create My Story</span>
            <span className="text-xs opacity-90 font-normal">產生我的故事</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
        <p className="font-display text-xl text-slate-300 animate-pulse font-bold">Writing a magical story...</p>
        <p className="text-slate-500">正在創作神奇的故事...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10">
      {/* Story Content */}
      <div className="flex-1">
        <div className="bg-slate-800 p-6 md:p-8 rounded-3xl shadow-lg border border-slate-700 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">{story?.title}</h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => isPlayingStory ? stopSpeaking() : speakText(story?.content || '', true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                        isPlayingStory 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/30'
                    }`}
                >
                    {isPlayingStory ? <StopCircle size={20} /> : <PlayCircle size={20} />}
                    <span>{isPlayingStory ? 'Stop Reading' : 'Read to Me'}</span>
                </button>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none text-slate-300 leading-loose">
            {story?.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

            {/* Finish Button */}
           <div className="mt-8 pt-6 border-t border-slate-700">
               {!hasClaimedReward ? (
                   <button 
                    onClick={handleClaimReward}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse"
                   >
                       <Sparkles size={20} /> Finish & Collect 5 Water Drops!
                   </button>
               ) : (
                   <div className="w-full bg-slate-700 text-slate-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                       <CheckCircle2 size={20} className="text-green-500" /> Story Completed!
                   </div>
               )}
           </div>

          <div className="mt-4 flex justify-between items-center">
             <button onClick={() => { setStory(null); setTopic(''); stopSpeaking(); }} className="text-slate-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                Back to Library (返回)
             </button>
             <div className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full">
                Level: Grades 5-7
             </div>
          </div>
        </div>
      </div>

      {/* Vocabulary Sidebar */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-brand-yellow/10 p-6 rounded-3xl border border-brand-yellow/30 sticky top-24">
          <h3 className="font-display font-bold text-xl text-white mb-4 flex items-center">
            <Sparkles className="text-brand-yellow mr-2 fill-current" />
            <div>
                Magic Words
                <div className="text-xs text-slate-400 font-normal">單字小卡 (點擊聽發音)</div>
            </div>
          </h3>
          <div className="space-y-3">
            {story?.vocabulary.map((vocab, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedWord(vocab); speakText(vocab.word); }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                  selectedWord?.word === vocab.word
                    ? 'bg-slate-700 border-brand-yellow shadow-md transform scale-105'
                    : 'bg-slate-800/60 border-transparent hover:bg-slate-700 hover:border-brand-yellow/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-white text-lg">{vocab.word}</span>
                    <span className="text-sm font-bold text-brand-yellow/90 bg-brand-yellow/10 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{vocab.chineseDefinition}</span>
                </div>
                
                {selectedWord?.word === vocab.word && (
                    <div className="mt-3 text-sm text-slate-300 animate-fade-in border-t border-slate-600 pt-2 text-left">
                        <div className="flex items-center justify-between text-brand-blue font-mono mb-2">
                            <span>/{vocab.pronunciation}/</span>
                            <div className="p-1.5 bg-brand-blue/10 rounded-full hover:bg-brand-blue/20 cursor-pointer">
                                <Volume2 size={16} />
                            </div>
                        </div>
                        
                        {/* Primary Chinese Definition */}
                        <p className="text-lg font-bold text-brand-yellow mb-1">{vocab.chineseDefinition}</p>
                        
                        {/* English Definition */}
                        <p className="italic mb-3 text-slate-400">"{vocab.definition}"</p>
                        
                        {/* Examples */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-600">
                            <p className="text-slate-200 mb-2 leading-snug">
                                <span className="font-bold text-brand-yellow mr-1">Ex:</span> 
                                {vocab.exampleSentence}
                            </p>
                            <p className="text-slate-500 text-xs pl-6 border-l-2 border-slate-700">
                                {vocab.chineseExample}
                            </p>
                        </div>
                    </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
