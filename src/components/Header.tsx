
import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { GreetingType } from '../types';

export default function Header() {
  const { state } = useApp();
  const { userData } = state;

  const getGreeting = (): { text: string; type: GreetingType } => {
    const hour = new Date().getHours();
    const name = userData.name || 'there';
    
    if (hour >= 5 && hour < 12) {
      return { text: `Rise & Shine, ${name}!`, type: 'morning' };
    } else if (hour >= 12 && hour < 17) {
      return { text: `Hey There, ${name}!`, type: 'afternoon' };
    } else if (hour >= 17 && hour < 22) {
      return { text: `Wind Down, ${name}`, type: 'evening' };
    } else {
      return { text: `Hey Night Owl, ${name}`, type: 'night' };
    }
  };

  const greeting = getGreeting();
  const isStreakAchieved = userData.currentStreak >= userData.streakGoal;

  return (
    <header className="sticky top-0 z-40 bg-surface-elevated border-b border-default backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold flex items-center gap-2 ${isStreakAchieved ? 'animate-gold-pulse' : ''}`}>
            <span className="text-primary">Task</span>
            <span className="text-accent">Trail</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-secondary text-sm animate-slide-down">
              {greeting.text}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-full">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-current" />
              <span className="text-sm font-medium">{userData.totalStars}</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="text-sm">
              <span className="text-accent font-medium">{userData.currentStreak}</span>
              <span className="text-muted">/{userData.streakGoal}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sm:hidden px-4 pb-2">
        <p className="text-secondary text-sm animate-slide-down">
          {greeting.text}
        </p>
      </div>
    </header>
  );
}
