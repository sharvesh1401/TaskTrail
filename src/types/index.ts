
export interface Task {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  importance: ImportanceLevel;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ImportanceLevel = 'All-Out' | 'Focused' | 'Steady' | 'Chill';

export interface UserData {
  name: string;
  streakGoal: number;
  currentStreak: number;
  lastCompletedDate?: string;
  totalStars: number;
  autoDelete: boolean;
  hasSeenWelcome: boolean;
}

export interface FilterOptions {
  status: 'all' | 'active' | 'completed';
  importance: ImportanceLevel | 'all';
  deadline: 'all' | 'overdue' | 'today' | 'upcoming';
}

export type GreetingType = 'morning' | 'afternoon' | 'evening' | 'night';
