import React from 'react';
import Button from './Button';
import { Trophy, RefreshCw, Home, User } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  totalPossibleScore: number;
  onRestart: () => void;
  onHome: () => void;
  onDashboard: () => void;
  isLoggedIn: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalPossibleScore, onRestart, onHome, onDashboard, isLoggedIn }) => {
  const percentage = Math.round((score / totalPossibleScore) * 100) || 0;
  
  let message = "Good effort!";
  let color = "text-blue-400";
  
  if (percentage >= 90) {
      message = "Python Master!";
      color = "text-yellow-400";
  } else if (percentage >= 70) {
      message = "Great Job!";
      color = "text-green-400";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl opacity-20"></div>
            <Trophy size={80} className={`${color} relative z-10 drop-shadow-lg`} />
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-2">{message}</h2>
        <p className="text-slate-400 mb-8">You have completed the syllabus.</p>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-12 w-full max-w-sm">
            <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Total Score</div>
            <div className={`text-6xl font-bold ${color} mb-2`}>{score}</div>
            <div className="text-slate-500">out of {totalPossibleScore} XP</div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={onRestart} variant="primary">
                <RefreshCw size={18} /> Play Again
            </Button>
            {isLoggedIn && (
               <Button onClick={onDashboard} variant="secondary">
                   <User size={18} /> Profile
               </Button>
            )}
            <Button onClick={onHome} variant="ghost">
                <Home size={18} /> Home
            </Button>
        </div>
    </div>
  );
};

export default ResultScreen;