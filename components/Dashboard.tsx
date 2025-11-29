import React from 'react';
import { User, GameHistory } from '../types';
import Button from './Button';
import { Trophy, Calendar, Clock, ChevronLeft, LogOut, Code, Star } from 'lucide-react';
import { authService } from '../services/authService';

interface DashboardProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onBack, onLogout }) => {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Button variant="secondary" onClick={onBack} className="!px-3">
          <ChevronLeft size={20} /> Back
        </Button>
        <Button variant="danger" onClick={onLogout} className="!px-3">
          <LogOut size={18} className="mr-2" /> Logout
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
             {user.name.charAt(0).toUpperCase()}
           </div>
           <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1.5 rounded-full border border-slate-700">
             <div className="bg-green-500 w-3 h-3 rounded-full"></div>
           </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
          <p className="text-slate-400 mb-4">{user.email}</p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
               <Trophy className="text-yellow-400" size={20} />
               <div className="text-left">
                 <div className="text-xs text-slate-500 uppercase font-bold">Total XP</div>
                 <div className="text-xl font-bold text-white">{user.totalPoints}</div>
               </div>
            </div>
            
            <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
               <Code className="text-cyan-400" size={20} />
               <div className="text-left">
                 <div className="text-xs text-slate-500 uppercase font-bold">Games Played</div>
                 <div className="text-xl font-bold text-white">{user.history.length}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-slate-400" /> Recent Activity
      </h2>
      
      {user.history.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700 border-dashed">
          <p className="text-slate-400">No coding history yet. Start a challenge to earn XP!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {user.history.map((game, index) => (
            <div key={index} className="bg-slate-800 hover:bg-slate-750 transition-colors rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className={`p-3 rounded-lg ${
                    game.score > game.maxScore * 0.8 ? 'bg-green-500/10 text-green-400' : 
                    game.score > game.maxScore * 0.5 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                 }`}>
                   <Star size={20} />
                 </div>
                 <div>
                    <div className="font-semibold text-white">{game.difficulty} Challenge</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <span>{game.language}</span>
                      <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                      <span>{formatDate(game.date)}</span>
                    </div>
                 </div>
               </div>

               <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-700 pt-3 sm:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase">Score</div>
                    <div className="text-lg font-bold text-cyan-400">{game.score} <span className="text-xs text-slate-500">/ {game.maxScore}</span></div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;