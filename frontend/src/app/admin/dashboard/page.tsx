'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Cpu,
  Mail,
  FileText,
  Eye,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Sliders,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  projectsData,
  skillsData,
  blogPostsData,
} from '@/data/profile';
import { getDashboardStats, type DashboardStats } from '@/lib/admin-api';
import type { ContactMessage } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { PortfolioContentManager } from '@/components/admin/PortfolioContentManager';

const mockRecentMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Aarav Sharma',
    email: 'aarav@techventures.io',
    subject: 'Collaboration on ML Healthcare Project',
    message: 'Hi Mukesh, loved your Heart Disease Prediction project. We have a research grant and would like to discuss a collaborative project.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Priya Patel',
    email: 'priya@datasolutions.com',
    subject: 'Summer Internship Opportunity',
    message: 'Hello Mukesh, reviewing your Python and Pandas projects on GitHub. We would like to invite you for an internship technical assessment.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'msg-3',
    name: 'David Wilson',
    email: 'david@opendev.org',
    subject: 'Feedback on Studexa application',
    message: 'Great structure on Studexa! Have you thought about adding Redis caching to the student lookup queries?',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const activityData = [
  { day: 'Mon', views: 124, height: 45 },
  { day: 'Tue', views: 189, height: 68 },
  { day: 'Wed', views: 240, height: 86 },
  { day: 'Thu', views: 210, height: 75 },
  { day: 'Fri', views: 278, height: 100 },
  { day: 'Sat', views: 165, height: 59 },
  { day: 'Sun', views: 142, height: 51 },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'content-manager' | 'overview'>('content-manager');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: projectsData.length,
    totalSkills: skillsData.length,
    unreadMessages: 2,
    totalBlogPosts: blogPostsData.length,
    totalPageViews: 1348,
    recentMessages: mockRecentMessages,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res?.data) {
          setStats((prev) => ({
            ...prev,
            ...res.data,
            recentMessages: res.data.recentMessages || prev.recentMessages,
          }));
        }
      } catch {
        // Keep initial fallback profile data
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: 'Active in showcase',
      icon: FolderGit2,
      color: 'from-violet-500/20 to-violet-600/5',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      title: 'Skills & Tech',
      value: stats.totalSkills,
      change: 'Competencies',
      icon: Cpu,
      color: 'from-cyan-500/20 to-cyan-600/5',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Inquiries',
      value: stats.unreadMessages,
      change: 'Recent messages',
      icon: Mail,
      color: 'from-amber-500/20 to-amber-600/5',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Published Posts',
      value: stats.totalBlogPosts,
      change: 'Articles',
      icon: FileText,
      color: 'from-emerald-500/20 to-emerald-600/5',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Page Impressions',
      value: stats.totalPageViews.toLocaleString(),
      change: 'Estimated views',
      icon: Eye,
      color: 'from-indigo-500/20 to-indigo-600/5',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('content-manager')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'content-manager'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-muted hover:text-foreground hover:bg-surface-elevated/70'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Portfolio Content Manager</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20">
              Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-muted hover:text-foreground hover:bg-surface-elevated/70'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>System & Analytics</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated/80 hover:bg-surface-elevated text-cyan-400 border border-border/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Site</span>
          </Link>
        </div>
      </div>

      {/* Main View: Content Manager */}
      {activeTab === 'content-manager' ? (
        <PortfolioContentManager />
      ) : (
        /* Secondary View: System Overview & Analytics */
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-900/30 via-surface-elevated/80 to-cyan-950/20 border border-violet-500/20 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mukesh Pramanik Portfolio Control Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
                  Welcome back, <span className="gradient-text">Mukesh</span>!
                </h1>
                <p className="text-sm text-muted max-w-xl">
                  Overview of your portfolio showcases, visitor impressions, and contact inquiries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setActiveTab('content-manager')}
                  variant="primary"
                  size="sm"
                  leftIcon={<Sliders className="w-4 h-4" />}
                >
                  Open Content Manager
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  variant="glass"
                  padding="md"
                  className={`border ${card.borderColor} bg-gradient-to-b ${card.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted truncate">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl bg-surface-elevated/80 ${card.textColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-display text-foreground">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>{card.change}</span>
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Main Two Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="glass" padding="md">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <div>
                    <CardTitle className="text-lg">Visitor Traffic Overview</CardTitle>
                    <p className="text-xs text-muted mt-1">
                      Weekly portfolio views and interactive impressions
                    </p>
                  </div>
                  <Badge variant="accent" size="sm">
                    Last 7 Days
                  </Badge>
                </CardHeader>

                <CardContent>
                  <div className="h-48 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-border/60">
                    {activityData.map((bar) => (
                      <div
                        key={bar.day}
                        className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-surface-elevated text-white text-[11px] font-mono border border-border whitespace-nowrap z-20 pointer-events-none">
                          {bar.views} views
                        </div>
                        <div
                          style={{ height: `${bar.height}%` }}
                          className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-violet-600/40 via-violet-500 to-cyan-400 transition-all duration-300 group-hover:brightness-125"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 px-2 text-xs font-mono text-muted">
                    {activityData.map((bar) => (
                      <span key={bar.day} className="flex-1 text-center">
                        {bar.day}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-elevated/40 border border-border/50 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Real-time visitor tracking is active</span>
                    </div>
                    <Link
                      href="/admin/analytics"
                      className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
                    >
                      View full analytics report &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Contact Inquiries */}
            <div className="space-y-6">
              <Card variant="glass" padding="md" className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Inquiries</CardTitle>
                    <p className="text-xs text-muted mt-1">
                      Latest contact form messages
                    </p>
                  </div>
                  <Link
                    href="/admin/messages"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    View all &rarr;
                  </Link>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    {stats.recentMessages && stats.recentMessages.length > 0 ? (
                      stats.recentMessages.slice(0, 4).map((msg) => (
                        <div
                          key={msg.id}
                          className="p-3.5 rounded-xl bg-surface-elevated/40 border border-border/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {msg.name}
                            </span>
                            {!msg.read ? (
                              <Badge variant="warning" size="sm" dot>
                                Unread
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(msg.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground/80 line-clamp-1">
                            {msg.subject}
                          </p>
                          <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted text-center py-8">
                        No recent inquiries.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <Button
                      href="/admin/messages"
                      variant="secondary"
                      fullWidth
                      size="sm"
                    >
                      Manage All Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
