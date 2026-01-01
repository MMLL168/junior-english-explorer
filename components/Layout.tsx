import React from 'react';
import { AppView } from '../types';
import { BookOpen, PenTool, Award, Home, Mic, Settings, Headphones, Sprout, GraduationCap } from 'lucide-react';
import { removeApiKeyFromStorage } from '../services/geminiService';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  colorClass: string;
}> = ({ active, onClick, icon, label, subLabel, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 transform min-w-[3rem] md:min-w-[4rem] ${
      active 
        ? `${colorClass} text-slate-900 scale-110 shadow-lg shadow-black/50 font-bold` 
        : 'bg-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-200 hover:scale-105'
    }`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] md:text-xs font-bold font-display leading-none hidden md:block">{label}</span>
    <span className="text-[10px] md:text-[10px] opacity-80 mt-0.5">{subLabel}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 md:pb-0">
      {/* Top Header */}
      <header className="bg-[#1e293b] shadow-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onChangeView(AppView.HOME)}>
            <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold shadow-md text-lg">
              JE
            </div>
            <div>
                <h1 className="text-xl font-display font-bold text-white leading-none">
                <span className="text-brand-blue">English</span> Explorer
                </h1>
                <p className="text-xs text-slate-400 font-bold tracking-wide">英語探索者</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick access to garden status could go here, but kept simple for now */}
             <button 
                onClick={() => {
                    if(confirm('Are you sure you want to remove your API Key? (您確定要移除金鑰嗎？)')) {
                        removeApiKeyFromStorage();
                    }
                }}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset API Key"
             >
                <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Bottom Navigation (Mobile & Tablet friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-md border-t border-slate-700 shadow-2xl p-2 z-50">
        <div className="max-w-2xl mx-auto flex justify-between gap-1 overflow-x-auto">
          <NavButton 
            active={currentView === AppView.HOME} 
            onClick={() => onChangeView(AppView.HOME)}
            icon={<Home size={20} />}
            label="Home"
            subLabel="首頁"
            colorClass="bg-brand-blue text-white"
          />
          <NavButton 
            active={currentView === AppView.VOCAB} 
            onClick={() => onChangeView(AppView.VOCAB)}
            icon={<GraduationCap size={20} />}
            label="Vocab"
            subLabel="單字"
            colorClass="bg-indigo-500 text-white"
          />
          <NavButton 
            active={currentView === AppView.STORY} 
            onClick={() => onChangeView(AppView.STORY)}
            icon={<BookOpen size={20} />}
            label="Story"
            subLabel="故事"
            colorClass="bg-brand-orange text-white"
          />
           {/* Center Garden Button */}
           <NavButton 
            active={currentView === AppView.GARDEN} 
            onClick={() => onChangeView(AppView.GARDEN)}
            icon={<Sprout size={24} />}
            label="Garden"
            subLabel="花園"
            colorClass="bg-emerald-500 text-white shadow-emerald-500/50"
          />
          <NavButton 
            active={currentView === AppView.LISTENING} 
            onClick={() => onChangeView(AppView.LISTENING)}
            icon={<Headphones size={20} />}
            label="Listen"
            subLabel="聽力"
            colorClass="bg-brand-teal text-slate-900"
          />
          <NavButton 
            active={currentView === AppView.SPEAKING} 
            onClick={() => onChangeView(AppView.SPEAKING)}
            icon={<Mic size={20} />}
            label="Speak"
            subLabel="口說"
            colorClass="bg-pink-500 text-white"
          />
          <NavButton 
            active={currentView === AppView.QUIZ} 
            onClick={() => onChangeView(AppView.QUIZ)}
            icon={<Award size={20} />}
            label="Quiz"
            subLabel="測驗"
            colorClass="bg-brand-green text-white"
          />
          <NavButton 
            active={currentView === AppView.WRITING} 
            onClick={() => onChangeView(AppView.WRITING)}
            icon={<PenTool size={20} />}
            label="Writer"
            subLabel="寫作"
            colorClass="bg-brand-purple text-white"
          />
        </div>
      </nav>
    </div>
  );
};
