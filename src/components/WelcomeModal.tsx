import React, { useState } from 'react';
import { CheckCircle, Target } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function WelcomeModal() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [streakGoal, setStreakGoal] = useState(7);
  
  if (!state.showWelcomeModal) return null;

  const handleComplete = () => {
    dispatch({
      type: 'SET_USER_DATA',
      userData: {
        name: name.trim() || 'Champion',
        streakGoal,
        hasSeenWelcome: true,
      },
    });
    dispatch({ type: 'SET_SHOW_WELCOME_MODAL', show: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-elevated border border-default rounded-xl p-6 w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img 
              src="/src/assets/tasktrail-logo.svg" 
              alt="TaskTrail Logo" 
              className="w-10 h-10"
            />
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">Task</span>
              <span className="text-3xl font-bold text-accent-primary">Trail</span>
            </div>
          </div>
          <p className="text-secondary">
            Transform your to-dos into a rewarding habit-building journey
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">What should we call you?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Choose your streak goal</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setStreakGoal(days)}
                  className={`p-3 rounded-lg border transition-all hover-scale ${
                    streakGoal === days
                      ? 'bg-primary border-primary text-white'
                      : 'bg-surface-card border-default hover:border-primary/50'
                  }`}
                >
                  <div className="text-lg font-bold">{days}</div>
                  <div className="text-xs opacity-75">days</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm text-secondary">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span>Complete tasks to earn stars and build streaks</span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-accent-primary flex-shrink-0" />
              <span>Set goals and importance levels for better focus</span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium transition-colors hover-scale"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}