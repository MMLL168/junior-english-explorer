import React, { useState } from 'react';
import { generateStory } from '../services/geminiService';
import { StoryResponse, VocabularyWord } from '../types';
import { Sparkles, BookOpen, Volume2, ArrowRight, Loader2 } from 'lucide-react';

export const StoryMode: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setStory(null);
    setSelectedWord(null);
    try {
      const result = await generateStory(topic);
      setStory(result);
    } catch (e) {
      alert("Oops! The AI teacher is taking a break. Try again. (AI 老師累了，請再試一次)");
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
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
            <span className="text-xs text-slate-500">你想讀什麼樣的故事？例如：Space (太空), Dragons (龍), Cats (貓咪)</span>
          </p>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., A magical cat in Tokyo... (輸入主題)"
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
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Story Content */}
      <div className="flex-1">
        <div className="bg-slate-800 p-6 md:p-8 rounded-3xl shadow-lg border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">{story?.title}</h2>
            <button onClick={() => { setStory(null); setTopic(''); }} className="text-slate-400 hover:text-brand-orange text-sm font-bold flex flex-col items-end">
              <span>New Story</span>
              <span className="text-xs font-normal">讀新故事</span>
            </button>
          </div>
          
          <div className="prose prose-lg max-w-none text-slate-300 leading-loose">
            {story?.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Vocabulary Sidebar */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-brand-yellow/10 p-6 rounded-3xl border border-brand-yellow/30">
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
                onClick={() => setSelectedWord(vocab)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                  selectedWord?.word === vocab.word
                    ? 'bg-slate-700 border-brand-yellow shadow-md transform scale-105'
                    : 'bg-slate-800/60 border-transparent hover:bg-slate-700 hover:border-brand-yellow/50'
                }`}
              >
                <span className="font-bold text-white text-lg block">{vocab.word}</span>
                {selectedWord?.word === vocab.word && (
                    <div className="mt-2 text-sm text-slate-300 animate-fade-in">
                        <div className="flex items-center justify-between text-brand-blue font-mono mb-1">
                            <span>/{vocab.pronunciation}/</span>
                            <button onClick={(e) => { e.stopPropagation(); speakWord(vocab.word); }} className="p-2 bg-slate-600 rounded-full hover:bg-slate-500">
                                <Volume2 size={16} />
                            </button>
                        </div>
                        <p className="italic mb-2 text-slate-400">"{vocab.definition}"</p>
                        <p className="bg-yellow-900/30 p-2 rounded text-slate-300 border border-yellow-500/30">
                            Ex: {vocab.exampleSentence}
                        </p>
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
