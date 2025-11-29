import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameArena from './components/GameArena';
import ResultScreen from './components/ResultScreen';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { GameState, Difficulty, Language, User, View, GameHistory } from './types';
import { generateSyllabus } from './services/geminiService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [user, setUser] = useState<User | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    currentQuestionIndex: 0,
    score: 0,
    syllabus: [],
    timeLeft: 0,
    language: 'English',
    difficulty: 'Beginner',
    isPaused: false
  });

  // Check for logged-in user on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('welcome'); // Or direct to dashboard? Let's go to welcome to start playing.
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('welcome');
  };

  const startGame = async (difficulty: Difficulty, language: Language) => {
    setGameState(prev => ({ ...prev, status: 'loading', difficulty, language }));
    setView('game');
    
    try {
      const syllabus = await generateSyllabus(difficulty, language);
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        syllabus,
        currentQuestionIndex: 0,
        score: 0,
        timeLeft: syllabus[0].timeLimit
      }));
    } catch (error) {
      alert("Failed to generate course content. Please check API Key or try again.");
      setView('welcome');
      setGameState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleNextQuestion = (pointsEarned: number, skipped: boolean) => {
    setGameState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isFinished = nextIndex >= prev.syllabus.length;
      
      const newScore = prev.score + pointsEarned;
      const newStatus = isFinished ? 'completed' : 'playing';

      if (isFinished) {
        // Save history if user is logged in
        if (user) {
          const totalMaxScore = prev.syllabus.reduce((acc, curr) => acc + curr.points, 0);
          const historyItem: GameHistory = {
             id: crypto.randomUUID(),
             date: new Date().toISOString(),
             score: newScore,
             difficulty: prev.difficulty,
             language: prev.language,
             maxScore: totalMaxScore
          };
          authService.saveGameResult(historyItem);
          
          // Refresh user data from local storage to update points/history in UI
          const updatedUser = authService.getCurrentUser();
          if (updatedUser) setUser(updatedUser);
        }
      }

      return {
        ...prev,
        score: newScore,
        currentQuestionIndex: nextIndex,
        status: newStatus,
        timeLeft: isFinished ? 0 : prev.syllabus[nextIndex].timeLimit
      };
    });
  };

  const resetGame = () => {
    setGameState({
      status: 'idle',
      currentQuestionIndex: 0,
      score: 0,
      syllabus: [],
      timeLeft: 0,
      language: 'English',
      difficulty: 'Beginner',
      isPaused: false
    });
    setView('welcome');
  };

  const restartSameSettings = () => {
      // Re-trigger start game with existing settings
      startGame(gameState.difficulty, gameState.language);
  };

  // Render logic based on `view` state
  if (view === 'auth') {
    return (
      <AuthScreen 
        onSuccess={handleAuthSuccess} 
        onBack={() => setView('welcome')} 
      />
    );
  }

  if (view === 'dashboard' && user) {
    return (
      <Dashboard 
        user={user} 
        onBack={() => setView('welcome')} 
        onLogout={handleLogout}
      />
    );
  }

  // Game/Welcome Logic
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {view === 'welcome' && gameState.status === 'idle' && (
        <WelcomeScreen 
          onStart={startGame} 
          onLoginClick={() => setView('auth')}
          onProfileClick={() => setView('dashboard')}
          isLoading={false}
          user={user}
        />
      )}
      
      {gameState.status === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 font-mono animate-pulse">Generating Syllabus...</p>
        </div>
      )}

      {view === 'game' && gameState.status === 'playing' && gameState.syllabus.length > 0 && (
        <GameArena 
          challenge={gameState.syllabus[gameState.currentQuestionIndex]}
          totalQuestions={gameState.syllabus.length}
          currentQuestionIndex={gameState.currentQuestionIndex}
          score={gameState.score}
          language={gameState.language}
          onNext={handleNextQuestion}
          onGameOver={() => {
             setGameState(prev => ({ ...prev, status: 'completed' }));
             // Note: In a forced game over, we might not want to save history or save partial.
             // Currently only saving on full completion.
          }}
        />
      )}

      {gameState.status === 'completed' && (
        <ResultScreen 
            score={gameState.score}
            totalPossibleScore={gameState.syllabus.reduce((acc, curr) => acc + curr.points, 0)}
            onRestart={restartSameSettings}
            onHome={resetGame}
            onDashboard={() => setView('dashboard')}
            isLoggedIn={!!user}
        />
      )}
    </div>
  );
};

export default App;