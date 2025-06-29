import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface ChatboxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbox({ isOpen, onClose }: ChatboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Secure API call to backend endpoint
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are TrailGuide, a helpful AI productivity assistant for TaskTrail. Be friendly, concise, and focus on helping users with task management, goal setting, and productivity tips. Keep responses under 150 words.'
            },
            {
              role: 'user',
              content: inputText
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Groq API error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendClick = () => {
    sendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="chatbox-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-default bg-var(--chat-bg)">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
            <img 
              src="/src/assets/assistant-logo.svg" 
              alt="TrailGuide" 
              className="w-5 h-5"
              title="TrailGuide AI Assistant"
            />
          </div>
          <div>
            <h3 className="font-medium text-primary">TrailGuide</h3>
            <p className="text-xs text-muted">Your AI productivity assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-card rounded-full transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-muted py-8">
            <img 
              src="/src/assets/assistant-logo.svg" 
              alt="TrailGuide" 
              className="w-12 h-12 mx-auto mb-3 opacity-50"
            />
            <p className="mb-2">👋 Hi! I'm TrailGuide, your AI assistant.</p>
            <p className="text-sm">Ask me anything about task management, goal setting, or productivity tips!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.isUser
                  ? 'bubble-user animate-user-pop'
                  : 'bubble-trailguide animate-msg-in'
              }`}
              aria-label={message.isUser ? "Your Message" : "Message from TrailGuide"}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bubble-trailguide animate-msg-in">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-typing-dot"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="chat-input-container">
        <label htmlFor="chat-input" className="sr-only">Type a message</label>
        <div className="flex gap-2 items-end">
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message TrailGuide..."
            aria-placeholder="Type your message here"
            className="chat-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSendClick}
            disabled={!inputText.trim() || isLoading}
            className="send-button"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}