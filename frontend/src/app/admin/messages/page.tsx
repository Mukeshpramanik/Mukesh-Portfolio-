'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  CheckCircle,
  Clock,
  User,
  AtSign,
  AlertTriangle,
  Reply,
  Inbox,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ContactMessage } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  getMessages,
  markMessageRead,
  deleteMessage,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

const initialMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Aarav Sharma',
    email: 'aarav@techventures.io',
    subject: 'Collaboration on ML Healthcare Project',
    message: `Hi Mukesh,

I came across your Heart Disease Prediction ML model on GitHub and was genuinely impressed by the exploratory data analysis and feature selection logic you implemented. 

Our university research lab is currently kicking off a grant-funded initiative on early cardiac risk detection using sensor and electronic health record data. We would love to discuss a collaborative project or exploratory student research role with you.

Are you available for a brief 15-minute call sometime next week?

Best regards,
Aarav Sharma
TechVentures Lab`,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
  },
  {
    id: 'msg-2',
    name: 'Priya Patel',
    email: 'priya@datasolutions.com',
    subject: 'Summer Internship Opportunity (Python / Data Analytics)',
    message: `Hello Mukesh,

We are reviewing engineering student portfolios for our 2025 Summer Data Analytics Internship Program. Your hands-on proficiency in Python, Pandas, SQL, and interactive dashboards closely matches our technical requirements.

Could you please send over your latest academic transcript and resume? We would be thrilled to schedule a preliminary technical screening.

Warm regards,
Priya Patel
Recruitment Lead | DataSolutions Pvt Ltd`,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
  },
  {
    id: 'msg-3',
    name: 'David Wilson',
    email: 'david@opendev.org',
    subject: 'Feedback on Studexa Database Application',
    message: `Hey Mukesh,

Just tested out your Studexa student database CRUD app repository. The relational schema constraints and separation of concerns are really well done for a 2nd year project!

One small suggestion: have you considered adding index hints or caching frequently queried student IDs with an in-memory cache? That could make a great follow-up blog post or v2 feature.

Keep up the great work!
David Wilson`,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 1d ago
  },
  {
    id: 'msg-4',
    name: 'Rohit Verma',
    email: 'rohit@campusconnect.in',
    subject: 'Speaker invitation: Student Developer Meetup',
    message: `Dear Mukesh,

CampusConnect is hosting a virtual weekend meetup for B.Tech CS students next month. We have a session dedicated to 'Starting Your Data Analytics Journey in College with Python'.

Given your projects and active writing, we think our community of 300+ students would gain immense value from your practical tips. Please let us know if you'd be interested!

Cheers,
Rohit Verma`,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2d ago
  },
  {
    id: 'msg-5',
    name: 'Sneha Rao',
    email: 'sneha@fintechlab.ai',
    subject: 'Question regarding portfolio interactive terminal',
    message: `Hi Mukesh,

Really loved the interactive terminal command palette on your portfolio! Did you write custom command parsing logic or use an open-source emulator? The animations feel super smooth.

Cheers,
Sneha`,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4d ago
  },
];

type MessageFilter = 'all' | 'unread' | 'read';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Selected message for details modal
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      let localInbox: ContactMessage[] = [];
      if (typeof window !== 'undefined') {
        try {
          localInbox = JSON.parse(localStorage.getItem('mukesh_portfolio_inbox') || '[]');
        } catch {
          // ignore parsing error
        }
      }

      try {
        setIsLoading(true);
        const res = await getMessages();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const combined = [...localInbox, ...res.data];
          setMessages(combined);
          return;
        }
      } catch {
        // Fallback to local messages
      } finally {
        setIsLoading(false);
      }

      setMessages([...localInbox, ...initialMessages]);
    };
    fetchRemote();
  }, []);

  const unreadCount = useMemo(() => {
    return messages.filter((m) => !m.read).length;
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (filter === 'unread') return messages.filter((m) => !m.read);
    if (filter === 'read') return messages.filter((m) => m.read);
    return messages;
  }, [messages, filter]);

  const handleMarkAsRead = async (msg: ContactMessage) => {
    if (msg.read) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
    );
    if (activeMessage?.id === msg.id) {
      setActiveMessage((prev) => (prev ? { ...prev, read: true } : null));
    }

    try {
      await markMessageRead(msg.id);
      toast.success('Marked as read.');
    } catch {
      toast.success('Marked as read locally.');
    }
  };

  const handleOpenDetail = (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (!msg.read) {
      handleMarkAsRead(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteMessage(deleteTarget.id);
      } catch {
        // offline mode
      }

      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (activeMessage?.id === deleteTarget.id) {
        setActiveMessage(null);
      }
      toast.success('Message deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Inquiries & Messages
            </h1>
            {unreadCount > 0 && (
              <Badge variant="warning" size="md" dot>
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Review incoming inquiries submitted through your portfolio contact form.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-elevated/70 border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'read'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Message List */}
      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-8 h-8 text-violet-400" />}
          title={
            filter === 'unread'
              ? 'No unread messages'
              : 'No contact inquiries found'
          }
          description={
            filter === 'unread'
              ? 'You have caught up with all incoming inquiries!'
              : 'Messages sent via the contact page will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <Card
              key={msg.id}
              variant="glass"
              padding="md"
              onClick={() => handleOpenDetail(msg)}
              className={`cursor-pointer transition-all border ${
                !msg.read
                  ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                  : 'border-border/70 hover:border-violet-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !msg.read
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-surface-elevated text-muted border border-border'
                    }`}
                  >
                    {!msg.read ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <MailOpen className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted font-mono">
                        &lt;{msg.email}&gt;
                      </span>
                      {!msg.read && (
                        <Badge variant="warning" size="sm" dot>
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs font-medium text-foreground/90 line-clamp-1">
                      {msg.subject}
                    </p>

                    <p className="text-xs text-muted line-clamp-1 max-w-2xl">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs text-muted font-mono">
                    {formatRelativeTime(msg.createdAt)}
                  </span>

                  <div className="flex items-center gap-1">
                    {!msg.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(msg);
                        }}
                        className="p-1.5 rounded-lg text-muted hover:text-emerald-400 hover:bg-surface-elevated transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(msg);
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      <Modal
        isOpen={Boolean(activeMessage)}
        onClose={() => setActiveMessage(null)}
        title={activeMessage?.subject || 'Contact Inquiry'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                const target = activeMessage;
                setActiveMessage(null);
                setDeleteTarget(target);
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMessage(null)}
              >
                Close
              </Button>
              {activeMessage && (
                <Button
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject
                  )}`}
                  variant="primary"
                  size="sm"
                  leftIcon={<Reply className="w-4 h-4" />}
                >
                  Reply via Email
                </Button>
              )}
            </div>
          </div>
        }
      >
        {activeMessage && (
          <div className="space-y-5">
            {/* Sender card */}
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-foreground">
                    {activeMessage.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <AtSign className="w-3.5 h-3.5" />
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="hover:text-cyan-400 underline transition-colors"
                  >
                    {activeMessage.email}
                  </a>
                </div>
              </div>

              <div className="text-xs text-muted font-mono flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(activeMessage.createdAt)}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-xl bg-surface border border-border/60">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {activeMessage.message}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete Message
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Permanently delete this message?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove inquiry from{' '}
            <strong className="text-foreground">
              {deleteTarget?.name}
            </strong>
            .
          </p>
        </div>
      </Modal>
    </div>
  );
}
