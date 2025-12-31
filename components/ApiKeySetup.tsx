import React, { useState } from 'react';
import { saveApiKeyToStorage, verifyApiKey } from '../services/geminiService';
import { Key, ShieldCheck, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';

export const ApiKeySetup: React.FC = () => {
  const [inputKey, setInputKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmedKey = inputKey.trim();
    
    if (trimmedKey.length < 10) {
      setErrorMsg("Please enter a valid API Key");
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    // 實際呼叫 API 驗證 Key 是否有效
    const isValid = await verifyApiKey(trimmedKey);

    if (isValid) {
      saveApiKeyToStorage(trimmedKey);
    } else {
      setErrorMsg("驗證失敗 (Verification Failed)。請確認 Key 是否正確，或是否已啟用 Billing。");
      setVerifying(false);
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
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Gemini API Key</label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setErrorMsg(null);
              }}
              disabled={verifying}
              placeholder="Paste your key here (AIzaSy...)"
              className={`w-full p-4 bg-slate-900 border rounded-xl text-white outline-none transition-all
                ${errorMsg 
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue'}
              `}
            />
            {errorMsg && (
              <p className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1">
                <XCircle size={12} /> {errorMsg}
              </p>
            )}
          </div>

          <button 
            onClick={handleSave}
            disabled={verifying || !inputKey}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
              ${verifying 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-brand-blue text-white hover:shadow-brand-blue/20 hover:-translate-y-1 active:scale-95'}
            `}
          >
            {verifying ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Verifying Key...
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                Connect & Start
              </>
            )}
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
