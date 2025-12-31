import React, { useState } from 'react';
import { saveApiKeyToStorage } from '../services/geminiService';
import { Key, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';

export const ApiKeySetup: React.FC = () => {
  const [inputKey, setInputKey] = useState('');

  const handleSave = () => {
    if (inputKey.trim().length > 10) {
      saveApiKeyToStorage(inputKey.trim());
    } else {
      alert("Please enter a valid API Key");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl flex items-center justify-center mb-6 mx-auto text-brand-blue">
          <Key size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-display">Teacher Setup</h1>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Welcome to English Explorer! To start the magic, please enter your Google Gemini API Key.
          <br/><span className="text-xs text-slate-500">(此設定只需做一次，金鑰會安全儲存在您的瀏覽器中)</span>
        </p>

        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl flex gap-3 items-start">
             <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
             <p className="text-xs text-yellow-200/80">
                Google blocked your previous key because it was on GitHub. Please generate a <b>NEW</b> key and paste it here. Do not commit this key to code!
             </p>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Gemini API Key</label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your new key here (AIzaSy...)"
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} />
            Connect & Start
          </button>

          <div className="text-center mt-4">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-brand-blue/80 hover:text-brand-blue text-xs flex items-center justify-center gap-1 hover:underline"
            >
              Get a new API Key <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
