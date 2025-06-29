import React from 'react';

interface DeepSeekButtonProps {
  onClick: () => void;
}

export default function DeepSeekButton({ onClick }: DeepSeekButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-accent-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-fast ease-accel z-50"
      aria-label="Chat with TrailGuide"
      title="Chat with TrailGuide"
    >
      <img 
        src="/src/assets/trailguide-icon.svg" 
        alt="TrailGuide" 
        className="w-6 h-6 text-white"
      />
    </button>
  );
}