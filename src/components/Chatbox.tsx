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
    <div className="fixed bottom-6 left-6 max-w-[400px] w-[90vw] max-h-[60vh] flex flex-col bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in backdrop-blur-xl border border-white/10">
      {/* Header - iMessage Style */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-hover rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/src/assets/assistant-logo.svg" 
              alt="TrailGuide" 
              className="w-6 h-6"
              title="TrailGuide AI Assistant"
            />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">TrailGuide</h3>
            <p className="text-xs text-gray-400">AI Assistant • Online</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Messages Container - iMessage Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-[#0a0a0a]">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-hover rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img 
                src="/src/assets/assistant-logo.svg" 
                alt="TrailGuide" 
                className="w-8 h-8"
              />
            </div>
            <p className="mb-2 text-white font-medium">👋 Hey there! I'm TrailGuide</p>
            <p className="text-sm text-gray-400">Your AI productivity assistant is here to help with tasks, goals, and productivity tips!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-msg-in`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                message.isUser
                  ? 'bg-[#007AFF] text-white rounded-[20px] rounded-br-[8px] shadow-lg'
                  : 'bg-[#2a2a2a] text-white rounded-[20px] rounded-bl-[8px] shadow-lg border border-white/10'
              }`}
              aria-label={message.isUser ? "Your Message" : "Message from TrailGuide"}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-msg-in">
            <div className="bg-[#2a2a2a] text-white rounded-[20px] rounded-bl-[8px] px-4 py-3 shadow-lg border border-white/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - iMessage Style */}
      <div className="p-4 bg-[#1a1a1a] border-t border-white/10">
        <label htmlFor="chat-input" className="sr-only">Type a message</label>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="iMessage"
              aria-placeholder="Type your message here"
              className="w-full bg-[#2a2a2a] border border-white/20 rounded-full px-4 py-3 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendClick}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 bg-[#007AFF] hover:bg-[#0056CC] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}