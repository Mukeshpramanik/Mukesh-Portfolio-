'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
  CornerDownLeft,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { findAnswerInKnowledgeBase } from '@/data/knowledgeBase';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export function AskMukeshAI() {
  const { chatbotKnowledge } = usePortfolioContent();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm **Ask Mukesh AI** — a 100% browser-based assistant running entirely in your browser with zero external APIs (₹0 budget). Ask me anything about Mukesh's background, Python & Data skills, projects, or internship availability!",
      timestamp: 'Just now',
      suggestions: [
        'What are your top skills?',
        'Tell me about your featured projects',
        'Are you open for internships?',
        'Tell me about Studexa',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Realistic typing delay (simulates thought without any external network delay)
    setTimeout(() => {
      const { answer, suggestions } = findAnswerInKnowledgeBase(question, chatbotKnowledge);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation reset! What would you like to know about Mukesh?",
        timestamp: 'Just now',
        suggestions: [
          'What are your top skills?',
          'Tell me about your projects',
          'Are you available for hire?',
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating launcher trigger button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Ask Mukesh AI"
          className="relative group p-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-xl shadow-violet-600/30 flex items-center gap-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>

          <span className="hidden sm:inline-block font-medium text-sm pr-1">
            Ask Mukesh AI
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/30 border border-white/20">
            ₹0 API
          </span>
        </motion.button>
      </div>

      {/* Chat drawer dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[80vh] z-50 rounded-2xl glass-card bg-surface/95 border border-border/80 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/80 bg-surface-elevated/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">
                      Ask Mukesh AI
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Local AI
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    Instant answers • No external API • ₹0 cost
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        msg.sender === 'user'
                          ? 'bg-violet-600 text-white'
                          : 'bg-surface-elevated text-cyan-400 border border-border/80'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-tr-sm'
                          : 'bg-surface-elevated/90 border border-border/70 text-foreground rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line text-xs leading-relaxed">
                        {msg.text}
                      </div>

                      <span className="block mt-1 text-[9px] opacity-60 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Contextual Suggestion Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%] pl-9">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-surface-elevated/80 border border-border/70 text-muted hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-surface transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-elevated text-cyan-400 border border-border/80 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-sm bg-surface-elevated/90 border border-border/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-border/80 bg-surface-elevated/70">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skills, projects, college..."
                  className="flex-1 bg-surface border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-violet-500/80 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all shadow-md focus:outline-none"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-muted px-1">
                <span>Press Enter to send</span>
                <span className="font-mono">Local Knowledge Engine</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
