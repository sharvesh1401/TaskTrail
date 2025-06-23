
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, UserData, FilterOptions } from '../types';

interface AppState {
  tasks: Task[];
  userData: UserData;
  filterOptions: FilterOptions;
  showWelcomeModal: boolean;
  showStreakAchievement: boolean;
}

type AppAction =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'SET_USER_DATA'; userData: Partial<UserData> }
  | { type: 'SET_FILTER_OPTIONS'; filterOptions: Partial<FilterOptions> }
  | { type: 'SET_SHOW_WELCOME_MODAL'; show: boolean }
  | { type: 'SET_SHOW_STREAK_ACHIEVEMENT'; show: boolean }
  | { type: 'LOAD_DATA'; data: Partial<AppState> }
  | { type: 'AUTO_DELETE_COMPLETED' };

const initialState: AppState = {
  tasks: [],
  userData: {
    name: '',
    streakGoal: 7,
    currentStreak: 0,
    totalStars: 0,
    autoDelete: true,
    hasSeenWelcome: false,
  },
  filterOptions: {
    status: 'all',
    importance: 'all',
    deadline: 'all',
  },
  showWelcomeModal: false,
  showStreakAchievement: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTasks = [...state.tasks, action.task];
      return { ...state, tasks: newTasks };
    }
    
    case 'UPDATE_TASK': {
      const newTasks = state.tasks.map(task => 
        task.id === action.task.id ? action.task : task
      );
      return { ...state, tasks: newTasks };
    }
    
    case 'DELETE_TASK': {
      const newTasks = state.tasks.filter(task => task.id !== action.id);
      return { ...state, tasks: newTasks };
    }
    
    case 'TOGGLE_TASK': {
      const taskToToggle = state.tasks.find(task => task.id === action.id);
      if (!taskToToggle) return state;
      
      const now = new Date().toISOString();
      const wasCompleted = taskToToggle.completed;
      const newCompleted = !wasCompleted;
      
      const updatedTask = {
        ...taskToToggle,
        completed: newCompleted,
        completedAt: newCompleted ? now : undefined,
      };
      
      const newTasks = state.tasks.map(task => 
        task.id === action.id ? updatedTask : task
      );
      
      // Update streak and stars if task was just completed
      let newUserData = state.userData;
      if (newCompleted && !wasCompleted) {
        const today = new Date().toDateString();
        const lastCompletedDate = state.userData.lastCompletedDate 
          ? new Date(state.userData.lastCompletedDate).toDateString() 
          : null;
        
        let newStreak = state.userData.currentStreak;
        let showAchievement = false;
        
        if (lastCompletedDate !== today) {
          // First task completed today
          if (lastCompletedDate === new Date(Date.now() - 86400000).toDateString()) {
            // Consecutive day
            newStreak += 1;
          } else if (lastCompletedDate) {
            // Streak broken, restart
            newStreak = 1;
          } else {
            // First ever completion
            newStreak = 1;
          }
          
          // Check for streak achievement
          if (newStreak === state.userData.streakGoal) {
            showAchievement = true;
          }
        }
        
        newUserData = {
          ...state.userData,
          totalStars: state.userData.totalStars + 1,
          currentStreak: newStreak,
          lastCompletedDate: today,
        };
        
        return {
          ...state,
          tasks: newTasks,
          userData: newUserData,
          showStreakAchievement: showAchievement,
        };
      } else if (wasCompleted && !newCompleted) {
        // Task was uncompleted, remove a star
        newUserData = {
          ...state.userData,
          totalStars: Math.max(0, state.userData.totalStars - 1),
        };
      }
      
      return { ...state, tasks: newTasks, userData: newUserData };
    }
    
    case 'SET_USER_DATA': {
      const newUserData = { ...state.userData, ...action.userData };
      return { ...state, userData: newUserData };
    }
    
    case 'SET_FILTER_OPTIONS': {
      const newFilterOptions = { ...state.filterOptions, ...action.filterOptions };
      return { ...state, filterOptions: newFilterOptions };
    }
    
    case 'SET_SHOW_WELCOME_MODAL': {
      return { ...state, showWelcomeModal: action.show };
    }
    
    case 'SET_SHOW_STREAK_ACHIEVEMENT': {
      return { ...state, showStreakAchievement: action.show };
    }
    
    case 'LOAD_DATA': {
      return { ...state, ...action.data };
    }
    
    case 'AUTO_DELETE_COMPLETED': {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const newTasks = state.tasks.filter(task => {
        if (!task.completed || !task.completedAt) return true;
        return new Date(task.completedAt) > twoDaysAgo;
      });
      return { ...state, tasks: newTasks };
    }
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasktrail-tasks');
    const savedUserData = localStorage.getItem('tasktrail-userdata');
    
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const userData = savedUserData ? JSON.parse(savedUserData) : initialState.userData;
    
    dispatch({
      type: 'LOAD_DATA',
      data: {
        tasks,
        userData,
        showWelcomeModal: !userData.hasSeenWelcome,
      },
    });
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tasktrail-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('tasktrail-userdata', JSON.stringify(state.userData));
  }, [state.tasks, state.userData]);

  // Auto-delete completed tasks if enabled
  useEffect(() => {
    if (state.userData.autoDelete) {
      const interval = setInterval(() => {
        dispatch({ type: 'AUTO_DELETE_COMPLETED' });
      }, 60 * 60 * 1000); // Check every hour
      
      return () => clearInterval(interval);
    }
  }, [state.userData.autoDelete]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
