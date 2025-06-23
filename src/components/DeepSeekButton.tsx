
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface DeepSeekButtonProps {
  onClick: () => void;
}

export default function DeepSeekButton({ onClick }: DeepSeekButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg hover-scale z-50 flex items-center justify-center transition-colors"
      aria-label="Open DeepSeek AI Assistant"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
