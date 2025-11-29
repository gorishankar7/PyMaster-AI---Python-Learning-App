export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Language = 'English' | 'Hindi';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  difficulty: Difficulty;
  points: number;
  testCases: string[]; // Descriptions of test cases for UI
  timeLimit: number; // in seconds
}

export interface EvaluationResult {
  correct: boolean;
  output: string;
  feedback: string;
  pointsAwarded: number;
}

export interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'completed';
  currentQuestionIndex: number;
  score: number;
  syllabus: Challenge[];
  timeLeft: number;
  language: Language;
  difficulty: Difficulty;
  isPaused: boolean;
}

export interface GameHistory {
  id: string;
  date: string;
  score: number;
  difficulty: Difficulty;
  language: Language;
  maxScore: number;
}

export interface User {
  email: string;
  name: string;
  totalPoints: number;
  history: GameHistory[];
}

export type View = 'welcome' | 'auth' | 'game' | 'dashboard';