import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ChatboxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

export default function Chatbox({ isOpen, onClose }: ChatboxProps) {
  const { state } = useApp();
  const { tasks } = state;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-focus input when chat opens or after sending a message
  useEffect(() => {
    if (isOpen && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isOpen, isLoading]);

  const detectTaskContext = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Look for task-related phrases
    const taskPhrases = [
      'help me with',
      'how do i complete',
      'how to finish',
      'stuck on',
      'need help with',
      'guidance on',
      'tips for'
    ];

    const hasTaskPhrase = taskPhrases.some(phrase => lowerMessage.includes(phrase));
    
    if (hasTaskPhrase) {
      // Try to find a matching task by title
      const matchedTask = tasks.find(task => 
        lowerMessage.includes(task.title.toLowerCase()) ||
        (task.goal && lowerMessage.includes(task.goal.toLowerCase()))
      );
      
      return matchedTask;
    }
    
    return null;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Detect task context
      const relatedTask = detectTaskContext(currentInput);
      
      // Build system prompt with task context if available
      let systemPrompt = 'You are TrailGuide, a helpful AI productivity assistant for TaskTrail. Be friendly, concise, and focus on helping users with task management, goal setting, and productivity tips. Keep responses under 150 words and be encouraging.';
      
      if (relatedTask) {
        systemPrompt += ` The user is asking for help with the task: "${relatedTask.title}"`;
        if (relatedTask.goal) {
          systemPrompt += ` (goal: "${relatedTask.goal}")`;
        }
        if (relatedTask.description) {
          systemPrompt += ` (description: "${relatedTask.description}")`;
        }
        systemPrompt += '. Provide step-by-step guidance tailored to this specific task.';
      }

      // Include current tasks context for better assistance
      const activeTasks = tasks.filter(task => !task.completed).slice(0, 5);
      if (activeTasks.length > 0 && !relatedTask) {
        systemPrompt += ` The user currently has ${activeTasks.length} active tasks: ${activeTasks.map(t => t.title).join(', ')}.`;
      }

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
              content: systemPrompt
            },
            {
              role: 'user',
              content: currentInput
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
        text: 'Oops, something went wrong. Try again?',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Re-focus input for continuous conversation
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
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
    <div 
      className="chatbox-container fixed bottom-6 left-6 max-w-[400px] w-[90vw] max-h-[60vh] flex flex-col rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in"
      style={{ 
        background: 'hsl(var(--bg-panel))',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
      aria-busy={isLoading}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-default">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
            <img 
              src="/src/assets/trailguide-icon.svg" 
              alt="TrailGuide" 
              className="w-5 h-5 text-white"
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
        >
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted py-8">
            <img 
              src="/src/assets/trailguide-icon.svg" 
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
            className={`flex animate-msg-in ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 text-sm leading-relaxed rounded-2xl ${
                message.isUser
                  ? 'text-white rounded-br-md'
                  : message.isError
                  ? 'bg-error/20 text-error border border-error/30 rounded-bl-md'
                  : 'text-primary rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.isUser 
                  ? 'hsl(var(--accent-primary))' 
                  : message.isError 
                  ? undefined 
                  : 'hsl(var(--chat-user-bg))'
              }}
              aria-label={message.isUser ? "Your Message" : "Message from TrailGuide"}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-msg-in">
            <div 
              className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{ backgroundColor: 'hsl(var(--chat-user-bg))' }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-imessage-typing"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-imessage-typing" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-imessage-typing" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-default">
        <div className="flex gap-2 items-end">
          <label htmlFor="chat-input" className="sr-only">Type a message</label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message TrailGuide..."
            className="flex-1 bg-surface-card border border-default rounded-full px-4 py-2 text-sm text-primary placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all"
            disabled={isLoading}
            aria-placeholder="Type your message here"
          />
          <button
            onClick={handleSendClick}
            disabled={!inputText.trim() || isLoading}
            className="bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-150 hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}