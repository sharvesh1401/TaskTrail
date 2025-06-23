
import React from 'react';
import { ArrowLeft } from 'lucide-react';
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
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Auto-delete setting */}
      <div className="bg-surface-card rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Streak Calendar */}
      <div className="bg-surface-card rounded-lg p-4">
        <h3 className="font-medium text-primary mb-4">Streak Calendar</h3>
        <StreakCalendar />
      </div>
    </div>
  );
}
