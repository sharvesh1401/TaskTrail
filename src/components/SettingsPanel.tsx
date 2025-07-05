import React from 'react';
import { ArrowLeft, Star, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Switch } from './ui/switch';
import StreakCalendar from './StreakCalendar';

interface SettingsPanelProps {
  onBack: () => void;
}

export default function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { state, dispatch } = useApp();
  const { userData } = state;

  const handleAutoDeleteToggle = (checked: boolean) => {
    dispatch({
      type: 'SET_USER_DATA',
      userData: { autoDelete: checked },
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface-card rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img 
            src="/src/assets/star-logo.svg" 
            alt="TaskTrail Star Logo" 
            className="w-6 h-6 drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-surface-card rounded-lg p-6 mb-6">
        <h3 className="font-medium text-primary mb-4">Your Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-accent-primary" />
              <span className="text-2xl font-bold text-primary">{userData.totalStars}</span>
            </div>
            <p className="text-sm text-muted">Total Stars</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-accent-secondary" />
              <span className="text-2xl font-bold text-primary">{userData.currentStreak}</span>
            </div>
            <p className="text-sm text-muted">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Auto-delete setting */}
      <div className="bg-surface-card rounded-lg">
        <div className="flex items-center justify-between py-4 px-6">
          <div className="flex-1">
            <h3 className="font-medium text-primary mb-1">
              Auto-delete completed tasks after 48 hours
            </h3>
            <p className="text-sm text-muted">
              Completed tasks older than two days will be removed automatically.
            </p>
          </div>
          <Switch
            checked={userData.autoDelete}
            onCheckedChange={handleAutoDeleteToggle}
          />
        </div>
        
        {/* Divider */}
        <div className="border-t border-white/20"></div>
        
        {/* Streak Calendar */}
        <div className="py-4 px-6">
          <h3 className="font-medium text-primary mb-4">Streak Calendar</h3>
          <StreakCalendar />
        </div>
      </div>
    </div>
  );
}