
import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function StreakCalendar() {
  const { state } = useApp();
  const { tasks } = state;

  // Get last 30 days
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    
    return days;
  };

  // Check if there are completed tasks on a given date
  const hasCompletedTasksOnDate = (date: Date) => {
    const dateString = date.toDateString();
    return tasks.some(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt).toDateString() === dateString
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const days = getDaysArray();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-3">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-xs text-muted text-center">
        {dayNames.map((day, index) => (
          <div key={index} className="p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const hasTask = hasCompletedTasksOnDate(date);
          const isCurrentDay = isToday(date);
          
          return (
            <div
              key={index}
              className={`
                w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors
                ${hasTask 
                  ? 'bg-success text-white' 
                  : 'bg-surface border border-border text-muted'
                }
                ${isCurrentDay ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
              `}
              title={`${date.toLocaleDateString()} ${hasTask ? '- Task completed' : '- No tasks'}`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-surface border border-border rounded"></div>
          <span>No tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-success rounded"></div>
          <span>Tasks completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-accent rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
