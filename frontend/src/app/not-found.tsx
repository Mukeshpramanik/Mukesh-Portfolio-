'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Terminal, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground px-4 py-16">
      {/* Background Animated Orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/15 blur-[120px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-8 glass-card p-8 sm:p-12 border-border/80 shadow-2xl">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-accent bg-accent/10 border border-accent/20">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Error 404 // Lost in Cyberspace</span>
        </div>

        {/* Glitch Animated 404 Text */}
        <div className="relative select-none">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl sm:text-9xl font-extrabold font-display tracking-tighter gradient-text"
          >
            404
          </motion.h1>
          <div className="absolute inset-0 text-8xl sm:text-9xl font-extrabold font-display tracking-tighter text-accent/20 blur-sm pointer-events-none animate-pulse">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Looks like you&apos;ve ventured into the digital void. The route you are trying to reach has moved, been archived, or never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border/40">
          <Button
            href="/"
            variant="primary"
            size="md"
            leftIcon={<Home className="w-4 h-4 mr-1" />}
            className="w-full sm:w-auto shadow-primary/30"
          >
            Back to Home
          </Button>

          <Button
            href="/terminal"
            variant="outline"
            size="md"
            leftIcon={<Terminal className="w-4 h-4 mr-1 text-accent" />}
            className="w-full sm:w-auto font-mono text-xs"
          >
            Try Terminal
          </Button>
        </div>
      </div>
    </div>
  );
}
