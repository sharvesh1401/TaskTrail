
import React from 'react';

export default function TrailGuideIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>TrailGuide Assistant</title>
      <desc>A map pin with chat bubble representing the TrailGuide AI assistant</desc>
      
      {/* Map pin shape (teardrop) */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="hsl(var(--accent))"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      
      {/* Chat bubble inside */}
      <circle
        cx="12"
        cy="9"
        r="3"
        fill="#FFFFFF"
      />
      <path
        d="M10.5 8h3c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5H12l-.5.5-.5-.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5z"
        fill="hsl(var(--accent))"
      />
    </svg>
  );
}
