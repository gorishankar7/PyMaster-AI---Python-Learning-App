import { User, GameHistory } from '../types';

const STORAGE_KEY_USERS = 'pymaster_users';
const STORAGE_KEY_CURRENT = 'pymaster_current_user';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
    const user = users[email];

    if (user && user.password === password) {
      localStorage.setItem(STORAGE_KEY_CURRENT, email);
      const { password, ...safeUser } = user;
      return safeUser;
    }
    throw new Error('Invalid email or password');
  },

  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
    
    if (users[email]) {
      throw new Error('User already exists');
    }

    const newUser = {
      email,
      password, // In a real app, never store plain text passwords!
      name,
      totalPoints: 0,
      history: []
    };

    users[email] = newUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_CURRENT, email);

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT);
  },

  getCurrentUser: (): User | null => {
    const email = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!email) return null;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
    const user = users[email];
    
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  saveGameResult: (historyItem: GameHistory) => {
    const email = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!email) return;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
    if (users[email]) {
      users[email].history.unshift(historyItem); // Add to beginning
      users[email].totalPoints += historyItem.score;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }
};