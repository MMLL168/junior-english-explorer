import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StoryMode } from './components/StoryMode';
import { QuizArena } from './components/QuizArena';
import { WritingLab } from './components/WritingLab';
import { SpeakingDojo } from './components/SpeakingDojo';
import { ListeningLab, ListeningState } from './components/ListeningLab';
import { Garden } from './components/Garden';
import { VocabGym } from './components/VocabGym';
import { ApiKeySetup } from './components/ApiKeySetup';
import { hasValidKey } from './services/geminiService';
import { AppView, UserResources, Plant } from './types';
import { Smile, Star, Zap, Mic, PenTool, Headphones, Sprout, Droplets, GraduationCap } from 'lucide-react';

// Custom notification for earning water
const WaterNotification: React.FC<{ amount: number; show: boolean }> = ({ amount, show }) => {
    if (!show) return null;
    return (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-blue-500/50 flex items-center gap-2 border-2 border-white">
                <Droplets size={20} fill="currentColor" /> +{amount} Water!
            </div>
        </div>
    );
};

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

    {/* Gamification Teaser */}
    <div 
        onClick={() => onChangeView(AppView.GARDEN)}
        className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-6 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform border border-emerald-500/30 flex items-center justify-between"
    >
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Sprout size={24} className="text-brand-green" />
                Magic Garden
            </h3>
            <p className="text-emerald-100 text-sm">Check your plants & collect rewards!<br/>檢查你的植物並領取獎勵！</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
            <Star size={24} fill="currentColor" className="text-brand-yellow" />
        </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4">
        {/* NEW: Vocab Button */}
        <button onClick={() => onChangeView(AppView.VOCAB)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Vocab Gym</h3>
            <h4 className="text-indigo-500 font-bold text-[10px] opacity-80">單字健身房</h4>
        </button>

        <button onClick={() => onChangeView(AppView.STORY)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-orange hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-brand-orange/20 text-brand-orange rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Star size={20} fill="currentColor" />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Stories</h3>
            <h4 className="text-brand-orange font-bold text-[10px] opacity-80">閱讀故事</h4>
        </button>

        <button onClick={() => onChangeView(AppView.LISTENING)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-teal hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-brand-teal/20 text-brand-teal rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Headphones size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Listening</h3>
            <h4 className="text-brand-teal font-bold text-[10px] opacity-80">聽力練習</h4>
        </button>

        <button onClick={() => onChangeView(AppView.SPEAKING)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-pink-500 hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-pink-500/20 text-pink-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mic size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Speak</h3>
            <h4 className="text-pink-500 font-bold text-[10px] opacity-80">口說練習</h4>
        </button>

        <button onClick={() => onChangeView(AppView.QUIZ)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-green hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-brand-green/20 text-brand-green rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap size={20} fill="currentColor" />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Quiz</h3>
            <h4 className="text-brand-green font-bold text-[10px] opacity-80">測驗挑戰</h4>
        </button>

        <button onClick={() => onChangeView(AppView.WRITING)} className="bg-slate-800 p-5 rounded-3xl shadow-lg border-2 border-slate-700 hover:border-brand-purple hover:bg-slate-750 group transition-all text-left">
            <div className="w-10 h-10 bg-brand-purple/20 text-brand-purple rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PenTool size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">Writer</h3>
            <h4 className="text-brand-purple font-bold text-[10px] opacity-80">寫作練習</h4>
        </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [hasKey, setHasKey] = useState(false);

  // Persistent state for Listening Lab (Now truly persistent via localStorage)
  const [listeningState, setListeningState] = useState<ListeningState>(() => {
    const saved = localStorage.getItem('JE_LISTENING_STATE');
    return saved ? JSON.parse(saved) : {
      topic: '',
      challenge: null,
      answers: {},
      isSubmitted: false,
      showScript: false
    };
  });

  // --- Gamification State ---
  // In a real app, this would be saved to localStorage or a database
  const [resources, setResources] = useState<UserResources>(() => {
      const saved = localStorage.getItem('JE_RESOURCES');
      return saved ? JSON.parse(saved) : { waterDrops: 10, stars: 0 }; // Start with 10 water drops for free
  });

  const [plants, setPlants] = useState<Plant[]>(() => {
      const saved = localStorage.getItem('JE_PLANTS');
      return saved ? JSON.parse(saved) : [
          { id: 1, stage: 1, type: 'sunflower', waterLevel: 0, waterNeeded: 2 },
          { id: 2, stage: 1, type: 'apple', waterLevel: 0, waterNeeded: 2 },
          { id: 3, stage: 1, type: 'cactus', waterLevel: 0, waterNeeded: 2 },
      ];
  });

  // Notification State
  const [showWaterNotif, setShowWaterNotif] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);

  // Save Resources to LocalStorage
  useEffect(() => {
    localStorage.setItem('JE_RESOURCES', JSON.stringify(resources));
  }, [resources]);

  // Save Plants to LocalStorage
  useEffect(() => {
    localStorage.setItem('JE_PLANTS', JSON.stringify(plants));
  }, [plants]);

  // Save Listening State to LocalStorage
  useEffect(() => {
    localStorage.setItem('JE_LISTENING_STATE', JSON.stringify(listeningState));
  }, [listeningState]);

  useEffect(() => {
    setHasKey(hasValidKey());
  }, []);

  const handleEarnWater = (amount: number) => {
      setResources(prev => ({ ...prev, waterDrops: prev.waterDrops + amount }));
      setLastEarned(amount);
      setShowWaterNotif(true);
      setTimeout(() => setShowWaterNotif(false), 2000);
  };

  if (!hasKey) {
    return <ApiKeySetup />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.STORY:
        return <StoryMode onEarnXP={() => handleEarnWater(5)} />;
      case AppView.QUIZ:
        return <QuizArena onEarnXP={(amount) => handleEarnWater(amount)} />;
      case AppView.WRITING:
        return <WritingLab onEarnXP={() => handleEarnWater(1)} />;
      case AppView.SPEAKING:
        return <SpeakingDojo onEarnXP={() => handleEarnWater(2)} />;
      case AppView.LISTENING:
        return <ListeningLab savedState={listeningState} onSaveState={setListeningState} onEarnXP={(amount) => handleEarnWater(amount)} />;
      case AppView.GARDEN:
        return <Garden resources={resources} plants={plants} onUpdatePlants={setPlants} onUpdateResources={setResources} />;
      case AppView.VOCAB:
        return <VocabGym onEarnXP={(amount) => handleEarnWater(amount)} />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      <WaterNotification amount={lastEarned} show={showWaterNotif} />
      {renderView()}
    </Layout>
  );
};

export default App;
