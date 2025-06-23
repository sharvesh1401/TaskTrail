
import React from 'react';
import TrailGuideIcon from './TrailGuideIcon';

interface DeepSeekButtonProps {
  onClick: () => void;
}

export default function DeepSeekButton({ onClick }: DeepSeekButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg hover-scale z-50 flex items-center justify-center transition-colors"
      aria-label="Chat with TrailGuide"
      title="Chat with TrailGuide"
    >
      <TrailGuideIcon className="w-6 h-6" />
    </button>
  );
}
