import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppProvider } from '../contexts/AppContext';
import ParticleBackground from '../components/ParticleBackground';
import Header from '../components/Header';
import WelcomeModal from '../components/WelcomeModal';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import FilterSort from '../components/FilterSort';
import TrailGuideButton from '../components/DeepSeekButton';
import Chatbox from '../components/Chatbox';
import Fireworks from '../components/Fireworks';
import SettingsPanel from '../components/SettingsPanel';
import { Task } from '../types';

function TaskTrailApp() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showChatbox, setShowChatbox] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [currentView, setCurrentView] = useState<'tasks' | 'settings'>('tasks');
  const [showFilterSort, setShowFilterSort] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskComplete = () => {
    setShowFireworks(true);
  };

  const handleFireworksComplete = () => {
    setShowFireworks(false);
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleFilterClick = () => {
    setShowFilterSort(!showFilterSort);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Header 
          onSettingsClick={handleSettingsClick}
          onFilterClick={handleFilterClick}
        />
        
        <main className="max-w-3xl w-11/12 mx-auto flex flex-col gap-6 py-6">
          {currentView === 'tasks' ? (
            <>
              {/* Desktop Add Task Button */}
              <div className="hidden sm:flex justify-center">
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-4 px-6 py-2 bg-accent-primary text-text-primary rounded-full hover:bg-accent-hover active:bg-accent-active transition-colors animate-pop flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Filter & Sort (Desktop) */}
              {showFilterSort && (
                <div className="hidden sm:block">
                  <FilterSort />
                </div>
              )}
              
              <div className="animate-fade-in">
                <TaskList onEditTask={handleEditTask} onTaskComplete={handleTaskComplete} />
              </div>

              {/* Mobile FAB */}
              <button
                onClick={() => setShowTaskForm(true)}
                className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-accent-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-fast ease-accel z-40"
                aria-label="Add Task"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </>
          ) : (
            <SettingsPanel onBack={() => setCurrentView('tasks')} />
          )}
        </main>
      </div>

      <WelcomeModal />
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseTaskForm}
        editingTask={editingTask}
      />
      
      <TrailGuideButton onClick={() => setShowChatbox(true)} />
      <Chatbox isOpen={showChatbox} onClose={() => setShowChatbox(false)} />
      <Fireworks isActive={showFireworks} onComplete={handleFireworksComplete} />

      {/* Mobile Filter & Sort Bottom Sheet */}
      {showFilterSort && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 bg-bg-panel border-t border-default rounded-t-lg z-30 animate-slide-up">
          <div className="p-4">
            <FilterSort />
          </div>
        </div>
      )}

      {/* Mobile Filter Overlay */}
      {showFilterSort && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowFilterSort(false)}
        />
      )}
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <TaskTrailApp />
    </AppProvider>
  );
};

export default Index;