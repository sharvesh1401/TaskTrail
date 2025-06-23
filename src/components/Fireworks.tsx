
import React from 'react';

interface FireworksProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function Fireworks({ isActive, onComplete }: FireworksProps) {
  React.useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Firework particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-accent rounded-full animate-firework"
          style={{
            left: '50%',
            top: '20%',
            animationDelay: `${i * 0.1}s`,
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
      
      {/* Additional particles around logo area */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`extra-${i}`}
          className="absolute w-1 h-1 bg-primary rounded-full animate-firework-sparkle"
          style={{
            left: `${45 + Math.random() * 10}%`,
            top: `${15 + Math.random() * 10}%`,
            animationDelay: `${0.2 + i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
