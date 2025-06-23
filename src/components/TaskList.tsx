
import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, Target, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Task } from '../types';
import { useApp } from '../contexts/AppContext';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export default function TaskList({ onEditTask }: TaskListProps) {
  const { state, dispatch } = useApp();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const filteredTasks = state.tasks.filter((task) => {
    const { status, importance, deadline } = state.filterOptions;
    
    // Status filter
    if (status === 'active' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;
    
    // Importance filter
    if (importance !== 'all' && task.importance !== importance) return false;
    
    // Deadline filter
    if (deadline !== 'all' && task.deadline) {
      const taskDeadline = new Date(task.deadline);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      if (deadline === 'overdue' && taskDeadline >= now) return false;
      if (deadline === 'today' && (taskDeadline < today || taskDeadline >= tomorrow)) return false;
      if (deadline === 'upcoming' && taskDeadline <= now) return false;
    } else if (deadline !== 'all' && !task.deadline) {
      return false;
    }
    
    return true;
  });

  const handleToggleTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    
    // Small delay for animation
    setTimeout(() => {
      dispatch({ type: 'TOGGLE_TASK', id: taskId });
      setCompletingTaskId(null);
    }, 200);
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', id: taskId });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'All-Out': return 'text-error border-error/20 bg-error/5';
      case 'Focused': return 'text-warning border-warning/20 bg-warning/5';
      case 'Steady': return 'text-success border-success/20 bg-success/5';
      case 'Chill': return 'text-secondary border-secondary/20 bg-secondary/5';
      default: return 'text-muted border-border bg-surface';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'All-Out': return '🔥';
      case 'Focused': return '⚡';
      case 'Steady': return '🎯';
      case 'Chill': return '😌';
      default: return '📋';
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
        <p className="text-muted">
          {state.tasks.length === 0 
            ? "Create your first task to start building your streak!" 
            : "Try adjusting your filters or create a new task."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className={`bg-surface-card border border-default rounded-xl p-4 transition-all duration-200 hover:bg-surface-elevated hover-scale ${
            task.completed ? 'opacity-60' : ''
          } ${completingTaskId === task.id ? 'animate-pop-in' : ''}`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleTask(task.id)}
              className="mt-0.5 transition-colors hover:scale-110 transform duration-150"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted hover:text-primary" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-medium leading-tight ${
                  task.completed ? 'line-through text-muted' : ''
                }`}>
                  {task.title}
                </h3>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-muted hover:text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted hover:text-error" />
                  </button>
                </div>
              </div>
              
              {task.description && (
                <p className="text-sm text-secondary mb-2 leading-relaxed">
                  {task.description}
                </p>
              )}
              
              {task.goal && (
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-sm text-secondary">{task.goal}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getImportanceColor(task.importance)}`}>
                  <span>{getImportanceIcon(task.importance)}</span>
                  {task.importance}
                </span>
                
                {task.deadline && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${
                    isOverdue(task.deadline)
                      ? 'text-error border-error/20 bg-error/5'
                      : 'text-secondary border-border bg-surface'
                  }`}>
                    {isOverdue(task.deadline) && <AlertTriangle className="w-3 h-3" />}
                    <Calendar className="w-3 h-3" />
                    {formatDeadline(task.deadline)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
