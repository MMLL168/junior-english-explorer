import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizResponse } from '../types';
import { Award, CheckCircle2, XCircle, RefreshCw, Loader2, BrainCircuit } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

export const QuizArena: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuizData(null);
    setCurrentQuestionIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);

    try {
      const data = await generateQuiz(topic);
      setQuizData(data);
    } catch (e) {
      alert("The Quiz Master is busy. Try again! (測驗大師忙碌中，請稍後再試)");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === quizData?.questions[currentQuestionIdx].correctAnswerIndex) {
      setScore(s => s + 1);
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4FACFE', '#FFD200', '#00F260']
      });
    }
  };

  const nextQuestion = () => {
    if (!quizData) return;
    if (currentQuestionIdx < quizData.questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
    } else {
        // End of quiz
        alert(`Quiz finished! Score: ${score + (selectedAnswer === quizData.questions[currentQuestionIdx].correctAnswerIndex ? 0 : 0)}/${quizData.questions.length}`);
        setQuizData(null);
        setTopic('');
    }
  };

  if (!quizData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-xl shadow-black/20 text-center w-full max-w-md border-b-8 border-brand-green ring-1 ring-slate-700">
          <div className="w-20 h-20 bg-brand-green/20 rounded-full mx-auto flex items-center justify-center mb-4">
            <BrainCircuit className="text-brand-green" size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Quiz Arena</h2>
          <h3 className="text-lg font-bold text-brand-green mb-2">測驗競技場</h3>
          <p className="text-slate-400 mb-6 text-sm">
            Test your knowledge! Pick a topic. <br/>
            <span className="text-xs text-slate-500">挑戰你的知識！輸入一個主題，例如：Travel (旅遊), Animals (動物)</span>
          </p>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (例如: Sports)..."
            className="w-full p-4 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-green-900/50 outline-none transition-all text-lg mb-4 text-white placeholder-slate-500"
          />
          
          <button
            onClick={handleStart}
            disabled={!topic.trim()}
            className="w-full bg-brand-green text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex flex-col items-center justify-center leading-tight"
          >
            <span>Start Challenge</span>
            <span className="text-xs opacity-90 font-normal">開始挑戰</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-green mb-4" size={48} />
        <p className="font-display text-xl text-slate-300 animate-pulse font-bold">Preparing tricky questions...</p>
        <p className="text-slate-500">正在準備題目...</p>
      </div>
    );
  }

  const currentQ = quizData?.questions[currentQuestionIdx];

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-xl shadow-black/20 overflow-hidden border border-slate-700">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-700 w-full">
                <div 
                    className="h-full bg-brand-green transition-all duration-500"
                    style={{ width: `${((currentQuestionIdx + 1) / (quizData?.questions.length || 1)) * 100}%` }}
                ></div>
            </div>

            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-brand-green tracking-wide uppercase">
                        Question {currentQuestionIdx + 1} of {quizData?.questions.length}
                    </span>
                    <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-sm font-bold">
                        Score 分數: {score}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-8 leading-snug">{currentQ?.question}</h3>

                <div className="space-y-3">
                    {currentQ?.options.map((option, idx) => {
                        let btnClass = "border-2 border-slate-600 bg-slate-900/50 hover:border-brand-green/50 hover:bg-slate-800 text-slate-200";
                        if (showResult) {
                            if (idx === currentQ.correctAnswerIndex) {
                                btnClass = "bg-green-900/40 border-brand-green text-brand-green font-bold";
                            } else if (idx === selectedAnswer) {
                                btnClass = "bg-red-900/40 border-red-500 text-red-400";
                            } else {
                                btnClass = "opacity-50 grayscale border-transparent";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-xl text-left transition-all duration-200 text-lg flex items-center justify-between ${btnClass}`}
                            >
                                <span>{option}</span>
                                {showResult && idx === currentQ.correctAnswerIndex && <CheckCircle2 size={24} />}
                                {showResult && idx === selectedAnswer && idx !== currentQ.correctAnswerIndex && <XCircle size={24} />}
                            </button>
                        );
                    })}
                </div>

                {showResult && (
                    <div className="mt-8 p-4 bg-blue-900/30 rounded-xl border border-blue-800 animate-fade-in">
                        <p className="font-bold text-blue-300 mb-1 flex items-center gap-2">
                             Teacher's Note <span className="text-xs font-normal bg-blue-900 px-2 py-0.5 rounded text-blue-200">解析</span>
                        </p>
                        <p className="text-blue-100 leading-relaxed">{currentQ?.explanation}</p>
                        <button 
                            onClick={nextQuestion}
                            className="mt-4 w-full bg-brand-blue text-white py-3 rounded-lg font-bold shadow hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>{currentQuestionIdx === (quizData?.questions.length || 0) - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                            <span className="text-sm opacity-80 font-normal">{currentQuestionIdx === (quizData?.questions.length || 0) - 1 ? '(完成測驗)' : '(下一題)'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};