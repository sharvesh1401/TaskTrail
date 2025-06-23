
import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { AppProvider } from '../contexts/AppContext';
import ParticleBackground from '../components/ParticleBackground';
import Header from '../components/Header';
import WelcomeModal from '../components/WelcomeModal';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import FilterSort from '../components/FilterSort';
import DeepSeekButton from '../components/DeepSeekButton';
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

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-6">
          {currentView === 'tasks' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Your Tasks</h1>
                <div className="flex items-center gap-3">
                  <FilterSort />
                  <button
                    onClick={() => setCurrentView('settings')}
                    className="p-2 hover:bg-surface-card rounded-lg transition-colors hover-scale"
                    aria-label="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover-scale"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
              
              <div className="animate-fade-in">
                <TaskList onEditTask={handleEditTask} onTaskComplete={handleTaskComplete} />
              </div>
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
      
      <DeepSeekButton onClick={() => setShowChatbox(true)} />
      <Chatbox isOpen={showChatbox} onClose={() => setShowChatbox(false)} />
      <Fireworks isActive={showFireworks} onComplete={handleFireworksComplete} />
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
