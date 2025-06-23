
import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { FilterOptions, ImportanceLevel } from '../types';

export default function FilterSort() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    dispatch({
      type: 'SET_FILTER_OPTIONS',
      filterOptions: { [key]: value },
    });
  };

  const hasActiveFilters = 
    state.filterOptions.status !== 'all' ||
    state.filterOptions.importance !== 'all' ||
    state.filterOptions.deadline !== 'all';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-surface-card hover:bg-surface-elevated border border-default rounded-lg transition-colors ${
          hasActiveFilters ? 'border-primary text-primary' : ''
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filter & Sort</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-surface-elevated border border-default rounded-lg shadow-lg z-10 animate-scale-in">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={state.filterOptions.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Importance</label>
              <select
                value={state.filterOptions.importance}
                onChange={(e) => handleFilterChange('importance', e.target.value as ImportanceLevel | 'all')}
                className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              >
                <option value="all">All Levels</option>
                <option value="All-Out">🔥 All-Out</option>
                <option value="Focused">⚡ Focused</option>
                <option value="Steady">🎯 Steady</option>
                <option value="Chill">😌 Chill</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <select
                value={state.filterOptions.deadline}
                onChange={(e) => handleFilterChange('deadline', e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              >
                <option value="all">All Deadlines</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => dispatch({
                  type: 'SET_FILTER_OPTIONS',
                  filterOptions: { status: 'all', importance: 'all', deadline: 'all' },
                })}
                className="w-full px-3 py-2 bg-surface-card hover:bg-surface border border-default rounded-lg text-sm transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
