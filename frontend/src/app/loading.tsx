'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none">
      {/* Background ambient radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Pulsing ring around the MP logo */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-600/30 via-indigo-500/20 to-purple-600/30 blur-md pointer-events-none"
          />

          <BrandLogo
            size="xl"
            priority
            withGlow
            alt="Mukesh Pramanik MP Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 shadow-2xl shadow-violet-950/60"
          />
        </div>

        {/* Loading typography */}
        <div className="text-center space-y-1.5">
          <h2 className="font-display font-bold text-lg sm:text-xl tracking-tight text-foreground">
            Mukesh <span className="text-violet-500">Pramanik</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
            <span>Loading portfolio...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
