'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react';
import { terminalCommands } from '@/data/profile';
import { useThemeStore } from '@/stores/theme-store';
import { THEMES } from '@/config/themes';

interface HistoryEntry {
  command: string;
  output: string;
  isError?: boolean;
}

const ASCII_BANNER = `
  __  __       _              _       ____                              _ _    
 |  \\/  |_   _| | _____  ___ | |__   |  _ \\ _ __ __ _ _ __ ___   __ _  _(_) | __
 | |\\/| | | | | |/ / _ \\/ __|| '_ \\  | |_) | '__/ _\` | '_ \` _ \\ / _\` || | | |/ /
 | |  | | |_| |   <  __/\\__ \\| | | | |  __/| | | (_| | | | | | | (_| || | |   < 
 |_|  |_|\\__,_|_|\\_\\___||___/|_| |_| |_|   |_|  \\__,_|_| |_| |_|\\__,_(_)_|_|_|\\_\\

 Welcome to Mukesh's Interactive Terminal v1.0.0
 Type 'help' to view the available commands or 'matrix' for a digital rain effect.
`;

export default function TerminalPage() {
  const { theme, themeConfig, setTheme, toggleTheme } = useThemeStore();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-scroll to bottom whenever history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on mount & click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Matrix Rain Animation effect
  useEffect(() => {
    if (!showMatrix) return;

    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]*+=#@!%';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = themeConfig?.colors?.accent || '#22D3EE';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    // Stop matrix rain after 3.5 seconds
    const timeout = setTimeout(() => {
      setShowMatrix(false);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showMatrix, themeConfig?.colors?.accent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const rawCommand = inputVal.trim();
      if (!rawCommand) {
        setHistory((prev) => [...prev, { command: '', output: '' }]);
        setInputVal('');
        return;
      }

      const [cmd, ...args] = rawCommand.split(' ');
      const lowerCmd = cmd.toLowerCase();

      // Add to command history
      setCommandHistory((prev) => [...prev, rawCommand]);
      setHistoryIndex(-1);

      // Handle custom internal commands
      if (lowerCmd === 'clear') {
        setHistory([]);
        setInputVal('');
        return;
      }

      if (lowerCmd === 'theme') {
        const targetThemeArg = args[0]?.toLowerCase();
        if (!targetThemeArg) {
          toggleTheme();
          setHistory((prev) => [
            ...prev,
            {
              command: rawCommand,
              output: `Theme toggled to '${themeConfig.mode === 'dark' ? 'Minimal Light' : 'Dark Premium'}'. Type 'theme list' to view all 20 themes, or 'theme <id>' to switch.`,
            },
          ]);
        } else if (targetThemeArg === 'list') {
          const listStr = THEMES.map(
            (t, idx) => `  ${idx + 1 < 10 ? ' ' : ''}${idx + 1}. ${t.name} (id: ${t.id}) [${t.category}, ${t.mode}]`
          ).join('\n');
          setHistory((prev) => [
            ...prev,
            {
              command: rawCommand,
              output: `Available Portfolio Themes (20 total):\n${listStr}\n\nUsage: theme <id> (e.g. 'theme dracula', 'theme sunset', 'theme amoled-black')`,
            },
          ]);
        } else {
          const matched = THEMES.find(
            (t) =>
              t.id.toLowerCase() === targetThemeArg ||
              t.name.toLowerCase() === targetThemeArg ||
              t.id.replace(/-/g, '').toLowerCase() === targetThemeArg.replace(/-/g, '')
          );
          if (matched) {
            setTheme(matched.id);
            setHistory((prev) => [
              ...prev,
              {
                command: rawCommand,
                output: `Theme successfully switched to '${matched.name}' (${matched.description}).`,
              },
            ]);
          } else {
            setHistory((prev) => [
              ...prev,
              {
                command: rawCommand,
                output: `Theme '${targetThemeArg}' not recognized. Type 'theme list' to see all 20 available themes.`,
                isError: true,
              },
            ]);
          }
        }
        setInputVal('');
        return;
      }

      if (lowerCmd === 'matrix') {
        setShowMatrix(true);
        setHistory((prev) => [
          ...prev,
          {
            command: rawCommand,
            output: 'Entering the Matrix simulation...',
          },
        ]);
        setInputVal('');
        return;
      }

      if (lowerCmd === 'echo') {
        setHistory((prev) => [
          ...prev,
          {
            command: rawCommand,
            output: args.join(' '),
          },
        ]);
        setInputVal('');
        return;
      }

      if (lowerCmd === 'resume') {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        if (typeof window !== 'undefined') {
          window.open(`${basePath}/resume.pdf`, '_blank');
        }
        setHistory((prev) => [
          ...prev,
          {
            command: rawCommand,
            output: 'Opening Mukesh Pramanik verified engineering resume PDF in new tab...',
          },
        ]);
        setInputVal('');
        return;
      }

      if (terminalCommands[lowerCmd]) {
        setHistory((prev) => [
          ...prev,
          {
            command: rawCommand,
            output: terminalCommands[lowerCmd],
          },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: rawCommand,
            output: `Command not found: '${rawCommand}'. Type 'help' for available commands.`,
            isError: true,
          },
        ]);
      }

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      const nextIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <div className="py-20 sm:py-28 min-h-screen px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Matrix Rain Fullscreen Canvas */}
      {showMatrix && (
        <canvas
          ref={matrixCanvasRef}
          className="fixed inset-0 z-50 pointer-events-none bg-black/90"
        />
      )}

      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Portfolio</span>
        </Link>

        <span className="text-xs font-mono text-muted flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          bash • 80x24 • UTF-8
        </span>
      </div>

      {/* Terminal Window */}
      <div
        onClick={handleContainerClick}
        className={`w-full max-w-5xl rounded-2xl border border-violet-500/30 bg-[#0A0A0F]/95 backdrop-blur-xl shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col cursor-text ${
          isFullscreen ? 'fixed inset-4 max-w-none z-40' : 'h-[650px]'
        }`}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-b border-border/80 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            <span className="ml-3 text-xs font-mono text-muted flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-accent" />
              mukesh@portfolio: ~ (bash)
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            className="text-muted hover:text-foreground p-1"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 sm:p-6 font-mono text-xs sm:text-sm text-foreground overflow-y-auto space-y-4">
          {/* Welcome ASCII */}
          <pre className="text-accent font-mono text-[10px] sm:text-xs leading-none sm:leading-tight overflow-x-auto select-none opacity-90">
            {ASCII_BANNER}
          </pre>

          {/* Past Commands Output */}
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              {item.command !== '' && (
                <div className="flex items-center gap-2 text-muted">
                  <span className="text-primary font-semibold">
                    mukesh@portfolio
                  </span>
                  <span className="text-muted">:</span>
                  <span className="text-accent font-semibold">~</span>
                  <span className="text-foreground font-bold">$</span>
                  <span className="text-foreground">{item.command}</span>
                </div>
              )}
              {item.output && (
                <div
                  className={`pl-4 whitespace-pre-wrap leading-relaxed ${
                    item.isError ? 'text-red-400' : 'text-emerald-400/90'
                  }`}
                >
                  {item.output}
                </div>
              )}
            </div>
          ))}

          {/* Current Active Input Prompt */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-primary font-semibold select-none">
              mukesh@portfolio
            </span>
            <span className="text-muted select-none">:</span>
            <span className="text-accent font-semibold select-none">~</span>
            <span className="text-foreground font-bold select-none">$</span>
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-foreground outline-none border-none p-0 font-mono text-xs sm:text-sm caret-transparent"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Custom Blinking Cursor */}
              <span
                className="absolute pointer-events-none w-2 h-4 bg-accent animate-pulse"
                style={{
                  left: `${inputVal.length}ch`,
                }}
              />
            </div>
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
