import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StoryMode } from './components/StoryMode';
import { QuizArena } from './components/QuizArena';
import { WritingLab } from './components/WritingLab';
import { SpeakingDojo } from './components/SpeakingDojo';
import { ApiKeySetup } from './components/ApiKeySetup';
import { hasValidKey } from './services/geminiService';
import { AppView } from './types';
import { Smile, Star, Zap, Mic, PenTool } from 'lucide-react';

const Dashboard: React.FC<{ onChangeView: (view: AppView) => void }> = ({ onChangeView }) => (
  <div className="space-y-8 animate-fade-in pb-20">
    <div className="bg-gradient-to-r from-blue-900 to-brand-blue/80 rounded-3xl p-8 text-white shadow-xl shadow-black/30 relative overflow-hidden border border-blue-800/50">
        <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold mb-2">Welcome Back! 歡迎回來! 👋</h2>
            <p className="text-blue-100 text-lg mb-6">Ready to learn some new English today? <br/> 準備好學點新英文了嗎？</p>
            <button 
                onClick={() => onChangeView(AppView.STORY)}
                className="bg-white text-brand-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
                <span>Start Adventure</span>
                <span className="text-sm font-normal opacity-70">開始冒險</span>
            </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
            <Smile size={200} />
        </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <button onClick={() => onChangeView(AppView.STORY)} className="bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-orange hover:bg-slate-750 group transition-all text-left">
            <div className="w-12 h-12 bg-brand-orange/20 text-brand-orange rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star size={24} fill="currentColor" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Stories</h3>
            <h4 className="text-brand-orange font-bold text-xs mb-2">閱讀故事</h4>
        </button>

        <button onClick={() => onChangeView(AppView.SPEAKING)} className="bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-pink-500 hover:bg-slate-750 group transition-all text-left">
            <div className="w-12 h-12 bg-pink-500/20 text-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Speak</h3>
            <h4 className="text-pink-500 font-bold text-xs mb-2">口說練習</h4>
        </button>

        <button onClick={() => onChangeView(AppView.QUIZ)} className="bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-green hover:bg-slate-750 group transition-all text-left">
            <div className="w-12 h-12 bg-brand-green/20 text-brand-green rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Quiz</h3>
            <h4 className="text-brand-green font-bold text-xs mb-2">測驗挑戰</h4>
        </button>

        <button onClick={() => onChangeView(AppView.WRITING)} className="bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-purple hover:bg-slate-750 group transition-all text-left">
            <div className="w-12 h-12 bg-brand-purple/20 text-brand-purple rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Writer</h3>
            <h4 className="text-brand-purple font-bold text-xs mb-2">寫作練習</h4>
        </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(hasValidKey());
  }, []);

  if (!hasKey) {
    return <ApiKeySetup />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.STORY:
        return <StoryMode />;
      case AppView.QUIZ:
        return <QuizArena />;
      case AppView.WRITING:
        return <WritingLab />;
      case AppView.SPEAKING:
        return <SpeakingDojo />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
