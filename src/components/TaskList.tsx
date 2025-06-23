import React from 'react';
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Task } from '../types';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onTaskComplete: () => void;
}

export default function TaskList({ onEditTask, onTaskComplete }: TaskListProps) {
  const { state, dispatch } = useApp();
  const { tasks, filter } = state;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.deadline) return false;
    return new Date(task.deadline).getTime() < new Date().getTime();
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      onTaskComplete();
    }
    
    dispatch({
      type: 'TOGGLE_TASK',
      id,
    });
  };

  const deleteTask = (id: string) => {
    dispatch({
      type: 'DELETE_TASK',
      id,
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status === 'pending' && task.completed) return false;
    if (filter.status === 'completed' && !task.completed) return false;
    if (filter.importance && task.importance !== filter.importance) return false;
    return true;
  }).sort((a, b) => {
    if (filter.sortBy === 'deadline') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (filter.sortBy === 'importance') {
      const importanceOrder = { 'all-out': 0, 'focused': 1, 'steady': 2, 'chill': 3 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg mb-2">No tasks yet</p>
        <p className="text-sm">Add your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className={`bg-surface-card rounded-lg p-4 transition-all duration-200 hover:bg-surface-elevated hover-scale ${
            task.completed ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-success border-success'
                  : 'border-default hover:border-primary'
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${task.completed ? 'line-through text-muted' : 'text-primary'}`}>
                {task.title}
              </h3>
              
              {task.goal && (
                <p className={`text-sm mt-1 ${task.completed ? 'text-muted' : 'text-secondary'}`}>
                  Goal: {task.goal}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                <div className={`flex items-center gap-1 importance-${task.importance}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="capitalize">{task.importance.replace('-', ' ')}</span>
                </div>

                {task.deadline && (
                  <div className={`flex items-center gap-1 ${isOverdue(task) ? 'text-error' : ''}`}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(task.deadline)}</span>
                    {isOverdue(task) && <span className="text-error font-medium">Overdue</span>}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditTask(task)}
                className="p-1 hover:bg-surface-elevated rounded transition-colors"
                aria-label="Edit task"
              >
                <Edit2 className="w-4 h-4 text-muted hover:text-primary" />
              </button>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 hover:bg-surface-elevated rounded transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4 text-muted hover:text-error" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
