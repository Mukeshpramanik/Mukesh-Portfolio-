'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  GraduationCap,
  Briefcase,
  Award,
  Trophy,
  FileText,
  MessageSquareQuote,
  Mail,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Content Manager', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Interests', href: '/admin/interests', icon: CheckCircle2 },
  { label: 'Projects', href: '/admin/projects', icon: FolderGit2 },
  { label: 'Skills', href: '/admin/skills', icon: Cpu },
  { label: 'Education', href: '/admin/education', icon: GraduationCap },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Certifications', href: '/admin/certifications', icon: Award },
  { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  // If on login page, render clean layout without admin shell
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#12121A',
              color: '#F8FAFC',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            },
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#12121A',
              color: '#F8FAFC',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            },
          }}
        />

        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface/90 border-r border-border/80 backdrop-blur-2xl flex flex-col transition-transform duration-300 md:static md:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/60">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight group"
              aria-label="Mukesh Pramanik Content Manager Dashboard"
            >
              <BrandLogo
                size="sm"
                withGlow
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="gradient-text font-bold">Content Manager</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-violet-600/15 text-violet-400 font-semibold border border-violet-500/25 shadow-sm'
                      : 'text-muted hover:text-foreground hover:bg-surface-elevated/70'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive
                        ? 'text-violet-400'
                        : 'text-muted group-hover:text-foreground'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8B5CF6]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer with Quick Portfolio Link */}
          <div className="p-3 border-t border-border/60 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors border border-transparent hover:border-cyan-500/20"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Live Portfolio
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
                ↗
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 bg-surface/80 border-b border-border/60 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-muted hover:text-foreground rounded-xl bg-surface-elevated/60 border border-border/60 hover:bg-surface-elevated transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-foreground font-medium">Mukesh Pramanik</span>
                <span>/</span>
                <span className="text-violet-400 capitalize">
                  {pathname === '/admin' || pathname === '/admin/dashboard'
                    ? 'Content Manager'
                    : pathname.replace('/admin/', '').replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface-elevated transition-colors border border-border/70"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Site
              </Link>

              {/* User indicator */}
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-semibold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-foreground leading-none">
                    {admin?.username || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-muted font-mono leading-tight mt-0.5">
                    Logged in
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-muted hover:text-red-400 px-2.5 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
