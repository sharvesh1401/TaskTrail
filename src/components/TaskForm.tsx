
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Task, ImportanceLevel } from '../types';
import { useApp } from '../contexts/AppContext';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

export default function TaskForm({ isOpen, onClose, editingTask }: TaskFormProps) {
  const { dispatch } = useApp();
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [goal, setGoal] = useState(editingTask?.goal || '');
  const [importance, setImportance] = useState<ImportanceLevel>(editingTask?.importance || 'Steady');
  const [deadline, setDeadline] = useState(editingTask?.deadline || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      goal: goal.trim() || undefined,
      importance,
      deadline: deadline || undefined,
    };

    if (editingTask) {
      dispatch({
        type: 'UPDATE_TASK',
        task: { ...editingTask, ...taskData },
      });
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TASK', task: newTask });
    }

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setGoal('');
    setImportance('Steady');
    setDeadline('');
    onClose();
  };

  const importanceColors = {
    'All-Out': 'border-error text-error',
    'Focused': 'border-warning text-warning',
    'Steady': 'border-success text-success',
    'Chill': 'border-secondary text-secondary',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-elevated border border-default rounded-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-default">
          <h2 className="text-lg font-semibold">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-surface-card rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
              className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Goal (Optional)</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Read 20 pages, Run 5km"
              className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Importance Level</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as ImportanceLevel)}
              className={`w-full px-3 py-2 bg-surface-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${importanceColors[importance]}`}
            >
              <option value="All-Out">🔥 All-Out - Maximum priority</option>
              <option value="Focused">⚡ Focused - High priority</option>
              <option value="Steady">🎯 Steady - Medium priority</option>
              <option value="Chill">😌 Chill - Low priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-surface-card hover:bg-surface border border-default rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingTask ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
