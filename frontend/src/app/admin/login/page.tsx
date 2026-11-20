'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LocalOnlyNotice } from '@/components/admin/LocalOnlyNotice';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLocal, setIsLocal] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const local =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0';
      setIsLocal(local);
      if (local) {
        // In local development, the owner directly accesses the Content Manager
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  if (isLocal === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BrandLogo size="lg" withGlow priority />
        <p className="text-sm text-muted animate-pulse font-medium">
          Verifying environment...
        </p>
      </div>
    );
  }

  // Public website on GitHub Pages: show clear owner-only local notice
  if (!isLocal) {
    return <LocalOnlyNotice />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <BrandLogo size="lg" withGlow priority />
      <p className="text-sm text-muted font-medium">Opening Portfolio Content Manager...</p>
    </div>
  );
}
