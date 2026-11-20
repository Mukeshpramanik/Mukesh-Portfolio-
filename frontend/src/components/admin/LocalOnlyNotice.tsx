'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ExternalLink, Terminal, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function LocalOnlyNotice() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden bg-grid">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-fade-up">
        <Card variant="glass" padding="lg" hoverLift={false} className="border-border/80 shadow-2xl">
          <CardHeader className="text-center items-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/25 p-0.5 flex items-center justify-center text-violet-400 mb-4 shadow-lg shadow-violet-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold font-display text-foreground leading-snug">
              Editing is available only to the owner in the local development environment.
            </CardTitle>
            <CardDescription className="text-xs text-muted max-w-sm mt-2">
              The public website on GitHub Pages is strictly read-only.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-2 text-xs leading-relaxed text-muted">
              <p>
                <strong className="text-foreground">Why are editing controls disabled here?</strong>
              </p>
              <p>
                This portfolio is deployed as a 100% static, read-only website on <strong>GitHub Pages</strong> with a ₹0 budget. Static web hosting does not provide server-side authentication boundaries.
              </p>
              <p>
                To maintain complete data integrity, editing controls are never exposed on the public web. Public visitors cannot save, upload, modify, or delete any content.
              </p>
              <p>
                Only the verified repository owner updates the central content file (<code>frontend/src/data/portfolioContent.json</code>) locally and publishes updates through their authorized GitHub account.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider block">
                How the owner manages content locally:
              </span>
              <div className="p-3.5 rounded-xl bg-black/60 border border-border/70 font-mono text-xs text-cyan-400 space-y-1 overflow-x-auto">
                <p className="text-muted"># 1. Run local dev server</p>
                <p>cd frontend && npm run dev</p>
                <p className="text-muted pt-1"># 2. Open local Portfolio Content Manager</p>
                <p>http://localhost:3000/admin</p>
                <p className="text-muted pt-1"># 3. Export JSON &amp; commit to GitHub</p>
                <p>git add frontend/src/data/portfolioContent.json</p>
                <p>git commit -m &quot;update: portfolio content&quot; &amp;&amp; git push</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                href="/"
                size="md"
                fullWidth
                leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}
              >
                Return to Public Portfolio
              </Button>

              <Button
                variant="outline"
                href="https://github.com/Mukeshpramanik"
                external
                size="md"
                fullWidth
                rightIcon={<ExternalLink className="w-4 h-4 ml-1" />}
              >
                View GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LocalOnlyNotice;
