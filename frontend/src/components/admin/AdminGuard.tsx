'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LocalOnlyNotice } from './LocalOnlyNotice';

export interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isLocal, setIsLocal] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const local =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0';
      setIsLocal(local);
    }
  }, []);

  if (isLocal === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" color="primary" />
        <p className="text-sm text-muted animate-pulse">
          Checking local environment...
        </p>
      </div>
    );
  }

  // On deployed public website (GitHub Pages), editing functionality is completely disabled
  if (!isLocal) {
    return <LocalOnlyNotice />;
  }

  // Local development on localhost: Owner has direct access to Portfolio Content Manager
  return <>{children}</>;
}

export default AdminGuard;
