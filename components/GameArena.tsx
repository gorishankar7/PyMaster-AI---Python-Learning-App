import React, { useState, useEffect, useCallback } from 'react';
import { Challenge, EvaluationResult, Language } from '../types';
import { evaluateCode, getHint } from '../services/geminiService';
import Button from './Button';
import { Play, SkipForward, AlertCircle, Clock, Pause, HelpCircle, CheckCircle, XCircle, Terminal } from 'lucide-react';

interface GameArenaProps {
  challenge: Challenge;
  totalQuestions: number;
  currentQuestionIndex: number;
  score: number;
  language: Language;
  onNext: (points: number, skipped: boolean) => void;
  onGameOver: () => void;
}

const GameArena: React.FC<GameArenaProps> = ({
  challenge,
  totalQuestions,
  currentQuestionIndex,
  score,
  language,
  onNext,
  onGameOver
}) => {
  const [code, setCode] = useState(challenge.starterCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintText, setHintText] = useState('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);

  // Reset state when challenge changes
  useEffect(() => {
    setCode(challenge.starterCode);
    setOutput('');
    setFeedback(null);
    setHintsUsed(0);
    setHintText('');
    setLastResult(null);
    setTimeLeft(challenge.timeLimit);
    setIsPaused(false);
  }, [challenge]);

  // Timer logic
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNext(0, true); // Auto-skip on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onNext]);

  const handleRun = async () => {
    setIsRunning(true);
    setFeedback(null);
    setOutput('Running tests...');
    
    try {
      const result = await evaluateCode(challenge, code, language);
      setLastResult(result);
      setOutput(result.output);
      
      if (result.correct) {
        // Calculate final points: Base points - (hints * 20% penalty)
        const penalty = Math.min(hintsUsed * (challenge.points * 0.2), challenge.points * 0.8);
        const finalPoints = Math.max(0, Math.floor(result.pointsAwarded - penalty));
        setFeedback(`Success! +${finalPoints} XP`);
        // Small delay to read output before moving on
        setTimeout(() => {
            onNext(finalPoints, false);
        }, 2000);
      } else {
        setFeedback(result.feedback);
      }
    } catch (e) {
      setOutput('Error connecting to grading server.');
    } finally {
      setIsRunning(false);
    }
  };

  const requestHint = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    try {
      const hint = await getHint(challenge, code, language);
      setHintText(hint);
      setHintsUsed(prev => prev + 1);
      setShowHintModal(true);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col gap-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <div className="flex items-center gap-6">
           <div className="text-slate-400 text-sm">
             Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> / {totalQuestions}
           </div>
           <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl">
             <span>{score} XP</span>
           </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${timeLeft < 30 ? 'text-red-500 bg-red-900/20 animate-pulse' : 'text-slate-200 bg-slate-900'}`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsPaused(!isPaused)} title={isPaused ? "Resume" : "Stop Timer"}>
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </Button>
            <Button variant="danger" onClick={onGameOver}>Quit</Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 flex-1 min-h-0">
        
        {/* Left Col: Problem & Hints */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
                <span className={`text-xs px-2 py-1 rounded border ${
                    challenge.difficulty === 'Beginner' ? 'border-green-500 text-green-400' :
                    challenge.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-400' :
                    'border-red-500 text-red-400'
                }`}>{challenge.difficulty}</span>
            </div>
            
            <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
            </p>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Example Test Cases</h3>
                <ul className="space-y-2">
                    {challenge.testCases.map((tc, i) => (
                        <li key={i} className="text-xs font-mono text-cyan-300 bg-black/20 p-2 rounded block">
                            {tc}
                        </li>
                    ))}
                </ul>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex justify-between items-center">
             <Button variant="ghost" onClick={requestHint} disabled={hintsUsed >= 3}>
                <HelpCircle size={18} className="mr-2" />
                Get Hint (-20% XP)
             </Button>
             
             <Button variant="ghost" onClick={() => onNext(0, true)} className="text-slate-400 hover:text-white">
                Skip <SkipForward size={18} className="ml-2" />
             </Button>
          </div>
        </div>

        {/* Right Col: Code Editor & Output */}
        <div className="flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col relative group">
                <div className="bg-slate-950 px-4 py-2 text-xs text-slate-500 flex justify-between items-center border-b border-slate-800">
                    <span className="font-mono">main.py</span>
                    <span className="text-[10px] uppercase">Python 3.10</span>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-transparent text-slate-200 font-mono p-4 resize-none focus:outline-none focus:ring-0 text-sm leading-6"
                    spellCheck="false"
                    disabled={isPaused}
                />
                
                {/* Floating Run Button */}
                <div className="absolute bottom-4 right-4 opacity-100 transition-opacity">
                    <Button onClick={handleRun} isLoading={isRunning} className="shadow-lg shadow-cyan-900/50">
                        <Play size={18} className="mr-1 fill-current" /> Run Code
                    </Button>
                </div>
            </div>

            {/* Output Panel */}
            <div className={`h-1/3 bg-black rounded-xl border ${lastResult?.correct ? 'border-green-500/50' : 'border-slate-700'} p-4 overflow-y-auto font-mono text-sm`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs uppercase tracking-wider">
                    <Terminal size={14} /> Console Output
                </div>
                
                {output ? (
                    <div className="space-y-2">
                        <pre className="text-slate-300 whitespace-pre-wrap">{output}</pre>
                        {feedback && (
                            <div className={`mt-2 p-2 rounded border ${lastResult?.correct ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                <div className="flex items-start gap-2">
                                    {lastResult?.correct ? <CheckCircle size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
                                    <span>{feedback}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-slate-600 italic">Ready to run...</span>
                )}
            </div>
        </div>
      </div>

      {/* Hint Modal */}
      {showHintModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full border border-slate-600 shadow-2xl">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                      <HelpCircle /> Hint
                  </h3>
                  <p className="text-slate-200 mb-6">{hintText}</p>
                  <Button variant="secondary" onClick={() => setShowHintModal(false)} className="w-full">
                      Got it
                  </Button>
              </div>
          </div>
      )}
      
      {/* Pause Overlay */}
      {isPaused && (
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-40">
               <div className="text-center">
                   <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
                   <Button onClick={() => setIsPaused(false)} className="mx-auto">Resume</Button>
               </div>
           </div>
      )}
    </div>
  );
};

export default GameArena;