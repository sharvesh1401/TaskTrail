import React, { useState } from 'react';
import { Settings, Filter, Menu, X, Star, Zap } from 'lucide-react';
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

  return (
    <header className="sticky top-0 bg-bg-panel h-auto sm:h-16 z-10">
      {/* Mobile Header Layout (sm:hidden) */}
      <div className="flex flex-col w-full sm:hidden p-4">
        {/* Top Row: Logo + Title + Stats */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Logo + Title */}
          <div className="flex items-center">
            <img 
              src="/src/assets/fire-logo.svg" 
              alt="TaskTrail Fire Logo" 
              className="w-8 h-8 mr-2 drop-shadow-sm hover:scale-105 transition-transform duration-150 ease-in-out"
            />
            <h1 className="text-xl font-semibold text-text-primary">TaskTrail</h1>
          </div>
          
          {/* Right: Stats + Menu Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent-primary" />
              <span className="text-text-primary font-medium text-sm">{userData.totalStars}</span>
              <Zap className="w-4 h-4 text-accent-secondary ml-2" />
              <span className="text-text-primary font-medium text-sm">{userData.currentStreak}</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 hover:scale-105 transition ease-accel duration-fast ml-2"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Bottom Row: Greeting (Left-aligned) */}
        <div className="mt-3 flex justify-start">
          <span className="text-text-primary text-base">{greeting.text}</span>
        </div>
      </div>

      {/* Desktop Header Layout (hidden sm:flex) */}
      <div className="hidden sm:flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <img 
            src="/src/assets/fire-logo.svg" 
            alt="TaskTrail Fire Logo" 
            className="w-8 h-8 drop-shadow-sm hover:scale-105 transition-transform duration-150 ease-in-out"
          />
          
          <div className="ml-4 text-2xl font-semibold text-text-primary animate-slide-down">
            {greeting.text}
          </div>
        </div>
        
        {/* Desktop Controls */}
        <div className="flex items-center gap-4">
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

          {/* Stars and Streak Icons (Desktop) */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-accent-primary" />
            <span className="text-text-primary font-medium text-sm">{userData.totalStars}</span>
            <Zap className="w-4 h-4 text-accent-secondary ml-4" />
            <span className="text-text-primary font-medium text-sm">{userData.currentStreak}</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute top-full right-4 bg-bg-panel border border-default rounded-lg shadow-lg z-20 sm:hidden animate-slide-up">
          <div className="py-2">
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