import React, { useState } from 'react';
import { Star, Settings, Filter, Menu, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { GreetingType } from '../types';

interface HeaderProps {
  onSettingsClick: () => void;
  onFilterClick: () => void;
}

export default function Header({ onSettingsClick, onFilterClick }: HeaderProps) {
  const { state } = useApp();
  const { userData } = state;
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const handleMyStreakClick = () => {
    // Could open streak details modal
    console.log('My Streak clicked');
  };

  return (
    <header className="sticky top-0 bg-bg-panel h-16 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <img 
          src="/src/assets/tasktrail-logo.svg" 
          alt="TaskTrail Logo" 
          className="w-8 h-8"
        />
        <div className="ml-4 text-2xl font-semibold text-text-primary animate-slide-down sm:block hidden">
          {greeting.text}
        </div>
        <div className="ml-4 text-base font-semibold text-text-primary animate-slide-down mobile-greeting sm:hidden block">
          {greeting.text}
        </div>
      </div>
      
      {/* Desktop Controls */}
      <div className="hidden sm:flex items-center gap-4">
        <button
          onClick={handleMyStreakClick}
          className="text-text-muted hover:text-accent-primary transition-colors mobile-button-text"
        >
          My Streak
        </button>
        
        <button
          onClick={onFilterClick}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 hover:scale-105 transition ease-accel duration-fast"
          aria-label="Filter & Sort"
        >
          <Filter className="w-5 h-5" />
        </button>
        
        <button
          onClick={onSettingsClick}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 hover:scale-105 transition ease-accel duration-fast"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 hover:scale-105 transition ease-accel duration-fast"
          aria-label="Menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute top-16 right-4 bg-bg-panel border border-default rounded-lg shadow-lg z-20 sm:hidden animate-slide-up">
          <div className="py-2">
            <button
              onClick={() => {
                handleMyStreakClick();
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 text-left text-text-muted hover:text-accent-primary hover:bg-white/10 transition-colors mobile-button-text"
            >
              My Streak
            </button>
            <button
              onClick={() => {
                onFilterClick();
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 text-left text-text-muted hover:text-accent-primary hover:bg-white/10 transition-colors mobile-button-text"
            >
              Filter & Sort
            </button>
            <button
              onClick={() => {
                onSettingsClick();
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 text-left text-text-muted hover:text-accent-primary hover:bg-white/10 transition-colors mobile-button-text"
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-10 sm:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </header>
  );
}