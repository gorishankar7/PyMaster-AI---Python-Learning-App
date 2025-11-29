import React from 'react';
import { Difficulty, Language, User } from '../types';
import Button from './Button';
import { Terminal, Globe, Award, User as UserIcon, LogIn } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (diff: Difficulty, lang: Language) => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  isLoading: boolean;
  user: User | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLoginClick, onProfileClick, isLoading, user }) => {
  const [difficulty, setDifficulty] = React.useState<Difficulty>('Beginner');
  const [language, setLanguage] = React.useState<Language>('English');

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Auth Header */}
      <div className="absolute top-0 right-0 p-4 md:p-6 flex gap-3 z-10">
        {user ? (
          <Button variant="ghost" onClick={onProfileClick} className="!bg-slate-800/80 backdrop-blur border border-slate-700">
            <UserIcon size={18} className="text-cyan-400" />
            <span className="hidden sm:inline">{user.name}</span>
            <div className="bg-cyan-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded ml-1">
              {user.totalPoints} XP
            </div>
          </Button>
        ) : (
          <Button variant="ghost" onClick={onLoginClick} className="!bg-slate-800/80 backdrop-blur border border-slate-700">
            <LogIn size={18} />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <div className="mb-8 p-6 rounded-full bg-cyan-950/30 border border-cyan-500/30 animate-pulse-glow">
          <Terminal size={64} className="text-cyan-400" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          PyMaster AI
        </h1>
        <p className="text-slate-400 text-lg mb-12">
          Master Python through interactive, AI-generated challenges. <br/>
          <span className="text-sm opacity-75">Select your preferences to begin.</span>
        </p>

        <div className="w-full grid md:grid-cols-2 gap-8 mb-12">
          {/* Language Selection */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 justify-center text-slate-200">
              <Globe size={20} />
              <h3 className="font-semibold">Language / भाषा</h3>
            </div>
            <div className="flex gap-2 justify-center">
              {['English', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as Language)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === lang 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 justify-center text-slate-200">
              <Award size={20} />
              <h3 className="font-semibold">Difficulty</h3>
            </div>
            <div className="flex flex-col gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff as Difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    difficulty === diff 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={() => onStart(difficulty, language)} 
          isLoading={isLoading}
          className="w-full md:w-auto min-w-[200px] text-lg py-4"
        >
          Start Challenge
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;