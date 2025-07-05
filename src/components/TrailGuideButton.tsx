import React from 'react';
import { MapPin } from 'lucide-react';

interface TrailGuideButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function TrailGuideButton({ onClick, isVisible }: TrailGuideButtonProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-accent-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ease-out z-50 animate-scale-in"
      aria-label="Chat with TrailGuide"
      title="Chat with TrailGuide - Your AI productivity assistant"
    >
      <img 
        src="/src/assets/map-icon.svg" 
        alt="TrailGuide" 
        className="w-6 h-6 text-white"
      />
    </button>
  );
}