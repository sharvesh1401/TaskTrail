import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ChatboxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  provider?: string;
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
      'tips for',
      'how do i'
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

  const buildApiPayload = (userMessage: string) => {
    const relatedTask = detectTaskContext(userMessage);
    const currentTasks = tasks.filter(task => !task.completed).slice(0, 10);
    
    // Base system prompt
    let systemPrompt = "You are TrailGuide, an AI assistant for TaskTrail. Use the following list of the user's current tasks to give concise, actionable answers when asked. Do not re-prompt or loop. If the user asks general questions, answer normally without task context.";
    
    // Task-specific context if detected
    if (relatedTask) {
      systemPrompt = `You are TrailGuide, an AI assistant for TaskTrail. The user is asking for help with the task: "${relatedTask.title}"`;
      if (relatedTask.goal) {
        systemPrompt += ` (goal: "${relatedTask.goal}")`;
      }
      if (relatedTask.description) {
        systemPrompt += ` (description: "${relatedTask.description}")`;
      }
      systemPrompt += '. Provide step-by-step guidance tailored to this task.';
    }
    
    // Build tasks context for general assistance
    const tasksContext = currentTasks.map(task => ({
      title: task.title,
      goal: task.goal || '',
      importance: task.importance,
      status: task.completed ? 'completed' : 'pending'
    }));
    
    // Limit conversation history to last 20 messages
    const recentMessages = messages.slice(-20);
    
    return {
      systemPrompt,
      tasksContext: relatedTask ? [] : tasksContext, // Only include general context if not task-specific
      conversation: recentMessages,
      userMessage
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    // const currentInput = inputText; // Already captured before setInputText('')

    // Helper to append messages, similar to what user's example implies
    const appendMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
      setMessages(prev => [...prev, { ...message, id: Date.now().toString() + Math.random(), timestamp: new Date() }]);
    };

    // The user's example for sendMessage constructs the payload directly.
    // Our existing `buildApiPayload` is more sophisticated and should be used.
    // `SYSTEM_PROMPT` in the user's example would be part of this payload.
    // `tasksContext` and `conversation` (from `messages` state) are also handled by `buildApiPayload`.

    const payloadForApi = buildApiPayload(currentInput); // Use existing payload builder

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForApi), // Send the structured payload
      });

      const text = await res.text();
      let json: any; // Allow 'any' for json object that might be empty or have varied error structure
      try {
        json = text ? JSON.parse(text) : {}; // Ensure text is not empty before parsing
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr, "Raw response text:", text);
        // Default to an object that will likely trigger the error path below,
        // or ensure json.error can be populated from the raw text if it's a simple string error.
        json = { error: `Failed to parse server response. Raw text: ${text.substring(0, 100)}...` };
      }

      if (res.ok && json.reply) {
        appendMessage({ role: "assistant", content: json.reply, provider: json.provider });
      } else {
        // Prioritize error message from parsed JSON, then fallback.
        const errMsg = json.error || (res.ok ? "Received OK but no valid reply content." : `Chat API Error: ${res.status} - ${text.substring(0,100)}...`);
        console.error("TrailGuide AI error:", errMsg, "Raw text (if different from errMsg):", text);
        appendMessage({
          role: "assistant",
          content: errMsg || "Sorry, TrailGuide is unavailable right now.", // Fallback error message
          isError: true // Mark this message as an error for styling
        });
      }
    } catch (err) { // This catch is now primarily for network errors or issues before res.text()
      const errorMessageContent = err instanceof Error ? err.message : "A network or unknown error occurred.";
      console.error("TrailGuide AI fetch/network error:", errorMessageContent, err);
      appendMessage({ role: "assistant", content: "Sorry, AI is unavailable right now.", isError: true });
    } finally {
      setIsLoading(false);
      // Re-focus input, ensuring inputRef.current exists (it should if chatbox is open)
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
              src="/src/assets/map-icon.svg" 
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
              src="/src/assets/map-icon.svg" 
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
            className={`flex animate-msg-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 text-sm leading-relaxed rounded-2xl ${
                message.role === 'user'
                  ? 'text-white rounded-br-md'
                  : message.isError
                  ? 'bg-error/20 text-error border border-error/30 rounded-bl-md'
                  : 'text-primary rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.role === 'user' 
                  ? 'hsl(var(--accent-primary))' 
                  : message.isError 
                  ? undefined 
                  : 'hsl(var(--chat-user-bg))'
              }}
              aria-label={message.role === 'user' ? "Your Message" : "Message from TrailGuide"}
            >
              {message.content}
              {message.provider && (
                <div className="text-xs opacity-50 mt-1">
                  via {message.provider}
                </div>
              )}
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
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