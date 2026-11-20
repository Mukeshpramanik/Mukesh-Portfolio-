'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  User,
  Cpu,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Bot,
  Globe,
  Download,
  Upload,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  ExternalLink,
  Eye,
  X,
  FileDown,
  Info,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { BrandLogo } from '@/components/ui/BrandLogo';
import defaultContent from '@/data/portfolioContent.json';
import {
  savePortfolioContent,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_SYNC_EVENT,
  DEFAULT_INTERESTS,
} from '@/hooks/usePortfolioContent';
import { withBasePath } from '@/lib/utils';
import { getAutoProjectImage, PROJECT_IMAGE_PRESETS } from '@/lib/projectImages';

type SectionTab =
  | 'personal'
  | 'interests'
  | 'skills'
  | 'projects'
  | 'education'
  | 'experience'
  | 'certifications'
  | 'achievements'
  | 'resume'
  | 'chatbot'
  | 'website'
  | 'export';

const DRAFT_STORAGE_KEY = 'mukesh_portfolio_content_draft';

function PortfolioContentManagerComponent() {
  const [activeTab, setActiveTab] = useState<SectionTab>('personal');
  const [content, setContent] = useState<any>(defaultContent);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Self-saved reference to eliminate redundant re-rendering when this component triggers a save
  const selfSavedRef = useRef<any>(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    section: 'skills' | 'projects' | 'education' | 'experience' | 'certifications' | 'achievements' | 'chatbot';
    index: number;
    title: string;
  } | null>(null);

  // Editing modals
  const [editingSkill, setEditingSkill] = useState<{ index: number; data: any } | null>(null);
  const [editingProject, setEditingProject] = useState<{ index: number; data: any } | null>(null);
  const [editingEducation, setEditingEducation] = useState<{ index: number; data: any } | null>(null);
  const [editingExperience, setEditingExperience] = useState<{ index: number; data: any } | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<{ index: number; data: any } | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<{ index: number; data: any } | null>(null);
  const [editingChatbot, setEditingChatbot] = useState<{ index: number; data: any } | null>(null);

  // Core Fields of Interest state
  const [newInterestInput, setNewInterestInput] = useState('');
  const [editingInterestIndex, setEditingInterestIndex] = useState<number | null>(null);
  const [editingInterestValue, setEditingInterestValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const projectImageInputRef = useRef<HTMLInputElement>(null);

  // Load single source of truth from disk/API & localStorage on mount
  useEffect(() => {
    // 1. Try to load from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.personal || parsed.education || parsed.skills)) {
            setContent(parsed);
          }
        }
      } catch {}
    }

    // 2. Fetch from disk /api/content
    fetch(withBasePath('/api/content'), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.personal) {
          setContent(data);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
              localStorage.removeItem(DRAFT_STORAGE_KEY);
            } catch {}
          }
          setHasUnsavedDraft(false);
        }
      })
      .catch(() => {
        // Fallback defaultContent is already active
      });

    // 3. Listen for sync updates (e.g. from other admin tabs or external updates)
    // Ignores events dispatched by this component itself to avoid duplicate re-renders
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail && ce.detail !== selfSavedRef.current) {
        setContent(ce.detail);
      }
    };
    window.addEventListener(PORTFOLIO_SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(PORTFOLIO_SYNC_EVENT, handleSync);
    };
  }, []);

  // Helper to check if a string contains placeholder tokens
  // Fast path: strings > 200 chars or base64 data URIs are not placeholders
  const isPlaceholder = (val: string | undefined): boolean => {
    if (!val || typeof val !== 'string') return false;
    if (val.length > 200 || val.startsWith('data:')) return false;
    return val.includes('YOUR_') && val.includes('_HERE');
  };

  // Count active placeholders in current content (memoized to avoid recursive traversal on unrelated renders)
  const placeholderCount = useMemo(() => {
    let count = 0;
    const checkValue = (v: any) => {
      if (typeof v === 'string') {
        if (isPlaceholder(v)) count++;
      } else if (v && typeof v === 'object') {
        Object.values(v).forEach(checkValue);
      }
    };
    checkValue(content);
    return count;
  }, [content]);

  // Save current state directly to disk file and broadcast to all live components
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      selfSavedRef.current = content;
      const result = await savePortfolioContent(content);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setHasUnsavedDraft(false);
      if (result.success) {
        toast.success('Changes saved successfully to portfolioContent.json and synchronized immediately!');
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to save content: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  // Revert to repository JSON file
  const handleResetToDefault = useCallback(async () => {
    if (
      window.confirm(
        'Are you sure you want to discard local edits and reload the central portfolioContent.json?'
      )
    ) {
      setContent(defaultContent);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      selfSavedRef.current = defaultContent;
      await savePortfolioContent(defaultContent);
      setHasUnsavedDraft(false);
      toast.success('Reset to repository default content.');
    }
  }, []);

  // Export updated content as a JSON file download
  const handleExportJson = useCallback(() => {
    const jsonStr = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolioContent.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded portfolioContent.json successfully!');
  }, [content]);

  // Import JSON file from user's filesystem and immediately persist to disk
  const handleImportJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.personal || !parsed.skills || !parsed.projects) {
          throw new Error('Invalid portfolioContent.json schema');
        }
        selfSavedRef.current = parsed;
        setContent(parsed);
        await savePortfolioContent(parsed);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        setHasUnsavedDraft(false);
        toast.success(`Imported and saved ${file.name} successfully to portfolioContent.json!`);
      } catch (err: any) {
        toast.error('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Generic updater for personal info
  const handleUpdatePersonal = useCallback((field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
    setHasUnsavedDraft(true);
  }, []);

  // Logo upload handler for owner local preview/replace
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const updated = {
        ...content,
        personal: {
          ...content.personal,
          logoUrl: dataUrl,
        },
      };
      selfSavedRef.current = updated;
      setContent(updated);
      setHasUnsavedDraft(false);
      const result = await savePortfolioContent(updated);
      if (result.success) {
        toast.success('MP Brand Logo updated and synchronized immediately across your portfolio!');
      } else {
        toast.error(`Disk sync note: ${result.error || 'Saved in local session'}`);
      }
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  }, [content]);

  // Avatar upload handler (separate from brand logo)
  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const updated = {
        ...content,
        personal: {
          ...content.personal,
          avatarUrl: dataUrl,
        },
      };
      selfSavedRef.current = updated;
      setContent(updated);
      setHasUnsavedDraft(false);
      const result = await savePortfolioContent(updated);
      if (result.success) {
        toast.success('Profile photograph updated and synchronized immediately across your portfolio!');
      } else {
        toast.error(`Disk sync note: ${result.error || 'Saved in local session'}`);
      }
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }, [content]);

  // Project visual image upload handler
  const handleProjectImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditingProject((prev: any) => ({
        ...prev,
        data: {
          ...prev.data,
          imageUrl: dataUrl,
        },
      }));
      toast.success('Project visual preview updated. Click "Save Project" to confirm!');
    };
    reader.readAsDataURL(file);
    if (projectImageInputRef.current) projectImageInputRef.current.value = '';
  }, [editingProject]);

  // Generic updater for social links
  const handleUpdateSocial = useCallback((field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      personal: {
        ...prev.personal,
        socialLinks: {
          ...prev.personal.socialLinks,
          [field]: value,
        },
      },
    }));
    setHasUnsavedDraft(true);
  }, []);

  // Generic updater for website text
  const handleUpdateWebsiteText = useCallback((field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      websiteText: {
        ...prev.websiteText,
        [field]: value,
      },
    }));
    setHasUnsavedDraft(true);
  }, []);

  // Delete item with confirmation
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { section, index } = deleteTarget;

    const list = [...(content[section] || [])];
    list.splice(index, 1);
    const updatedContent = { ...content, [section]: list };
    selfSavedRef.current = updatedContent;
    setContent(updatedContent);

    if (section === 'education') {
      setHasUnsavedDraft(false);
      await savePortfolioContent(updatedContent);
      toast.success('Education record removed and synchronized across portfolio.');
    } else {
      setHasUnsavedDraft(true);
      toast.success(`Removed from ${section}. Remember to click "Save Draft" to write changes to disk.`);
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, [content, deleteTarget]);

  // Core Fields of Interest handlers
  const handleAddInterest = useCallback(async () => {
    const trimmed = newInterestInput.trim();
    if (!trimmed) {
      toast.error('Please enter an interest name.');
      return;
    }
    const currentList: string[] =
      content.interests && Array.isArray(content.interests)
        ? content.interests
        : DEFAULT_INTERESTS;
    if (currentList.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in your Core Fields of Interest.`);
      return;
    }
    const updated = [...currentList, trimmed];
    const updatedContent = { ...content, interests: updated };
    selfSavedRef.current = updatedContent;
    setContent(updatedContent);
    setNewInterestInput('');
    setHasUnsavedDraft(false);
    setIsSaving(true);
    try {
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Added "${trimmed}" to Core Fields of Interest!`);
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to add interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, newInterestInput]);

  const handleSaveEditedInterest = useCallback(async () => {
    if (editingInterestIndex === null) return;
    const trimmed = editingInterestValue.trim();
    if (!trimmed) {
      toast.error('Interest name cannot be empty.');
      return;
    }
    const currentList: string[] =
      content.interests && Array.isArray(content.interests)
        ? content.interests
        : DEFAULT_INTERESTS;
    if (
      currentList.some(
        (item, i) =>
          i !== editingInterestIndex && item.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      toast.error(`Another interest named "${trimmed}" already exists.`);
      return;
    }
    const updated = [...currentList];
    updated[editingInterestIndex] = trimmed;
    const updatedContent = { ...content, interests: updated };
    selfSavedRef.current = updatedContent;
    setContent(updatedContent);
    setEditingInterestIndex(null);
    setEditingInterestValue('');
    setHasUnsavedDraft(false);
    setIsSaving(true);
    try {
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Updated interest to "${trimmed}"!`);
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to update interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, editingInterestIndex, editingInterestValue]);

  const handleDeleteInterest = useCallback(async (index: number) => {
    const currentList: string[] =
      content.interests && Array.isArray(content.interests)
        ? content.interests
        : DEFAULT_INTERESTS;
    const target = currentList[index];
    const updated = currentList.filter((_, i) => i !== index);
    const updatedContent = { ...content, interests: updated };
    selfSavedRef.current = updatedContent;
    setContent(updatedContent);
    setHasUnsavedDraft(false);
    setIsSaving(true);
    try {
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Removed "${target}" from Core Fields of Interest.`);
      } else {
        toast.error(`Notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to remove interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  const handleMoveInterest = useCallback(async (index: number, direction: 'up' | 'down') => {
    const currentList: string[] =
      content.interests && Array.isArray(content.interests)
        ? content.interests
        : DEFAULT_INTERESTS;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentList.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...currentList];
    const temp = updated[targetIndex];
    updated[targetIndex] = updated[index];
    updated[index] = temp;

    const updatedContent = { ...content, interests: updated };
    selfSavedRef.current = updatedContent;
    // Optimistic UI state update: immediate DOM reorder without delay
    setContent(updatedContent);
    setHasUnsavedDraft(false);

    try {
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Moved "${updated[targetIndex]}" ${direction}!`, { id: 'interest-move-toast' });
      }
    } catch {
      // Local state and storage already updated
    }
  }, [content]);

  const handleResetInterests = useCallback(async () => {
    if (
      window.confirm(
        'Reset Core Fields of Interest back to the default 6 academic tags?'
      )
    ) {
      const updatedContent = { ...content, interests: DEFAULT_INTERESTS };
      selfSavedRef.current = updatedContent;
      setContent(updatedContent);
      setHasUnsavedDraft(false);
      setIsSaving(true);
      try {
        const result = await savePortfolioContent(updatedContent);
        if (result.success) {
          toast.success('Core Fields of Interest reset to default tags.');
        }
      } catch (err: any) {
        toast.error('Failed to reset: ' + err.message);
      } finally {
        setIsSaving(false);
      }
    }
  }, [content]);

  const handleSaveInterests = useCallback(async () => {
    const currentList: string[] =
      content.interests && Array.isArray(content.interests)
        ? content.interests
        : DEFAULT_INTERESTS;
    const updatedContent = { ...content, interests: currentList };
    selfSavedRef.current = updatedContent;
    setContent(updatedContent);
    setHasUnsavedDraft(false);
    setIsSaving(true);
    try {
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success('Core Fields of Interest saved and synchronized across your portfolio!');
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to save interests: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  const sectionTabs = useMemo(() => [
    { id: 'personal', label: 'Personal & Bio', icon: User },
    {
      id: 'interests',
      label: `Core Interests (${(content.interests || DEFAULT_INTERESTS).length})`,
      icon: CheckCircle2,
    },
    { id: 'skills', label: `Skills (${content.skills?.length || 0})`, icon: Cpu },
    { id: 'projects', label: `Projects (${content.projects?.length || 0})`, icon: FolderGit2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience & Internships', icon: Briefcase },
    { id: 'certifications', label: `Certificates (${content.certifications?.length || 0})`, icon: Award },
    { id: 'achievements', label: `Achievements (${content.achievements?.length || 0})`, icon: Sparkles },
    { id: 'resume', label: 'Resume PDF', icon: FileDown },
    { id: 'chatbot', label: 'Ask Mukesh AI Knowledge', icon: Bot },
    { id: 'website', label: 'Website Text & Socials', icon: Globe },
    { id: 'export', label: 'Export & Publish Guide', icon: Download },
  ], [
    content.interests,
    content.skills?.length,
    content.projects?.length,
    content.certifications?.length,
    content.achievements?.length,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card variant="glass" padding="md" hoverLift={false} className="border-border/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                Portfolio Content Manager
              </h2>
              <Badge variant="primary" size="sm">
                Local Only
              </Badge>
              {hasUnsavedDraft ? (
                <Badge variant="default" size="sm" className="border-amber-500/40 text-amber-300">
                  ● Unsaved Edits
                </Badge>
              ) : (
                <Badge variant="default" size="sm" className="border-emerald-500/40 text-emerald-400">
                  ✓ Synced to Disk
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted">
              Centralized editing for Mukesh Pramanik&apos;s digital portfolio. Edits are saved directly to{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-cyan-400">
                frontend/src/data/portfolioContent.json
              </code>
            </p>
          </div>

          {/* Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              leftIcon={<Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" />}
            >
              Preview JSON
            </Button>

            <Button
              variant={hasUnsavedDraft ? 'primary' : 'secondary'}
              size="sm"
              disabled={isSaving}
              onClick={handleSaveDraft}
              leftIcon={<Save className="w-3.5 h-3.5 mr-1" />}
              className={hasUnsavedDraft ? 'shadow-violet-600/40' : ''}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportJson}
              leftIcon={<Download className="w-3.5 h-3.5 mr-1" />}
              className="shadow-violet-600/30"
            >
              Export JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="w-3.5 h-3.5 mr-1" />}
            >
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefault}
              title="Reset to default repository content"
              className="text-muted hover:text-red-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Placeholder Status Banner */}
        {placeholderCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>{placeholderCount} unverified placeholder(s) detected:</strong> Items like YOUR_EMAIL_HERE or YOUR_COLLEGE_NAME_HERE need your real details before publishing.
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Needs Update
            </span>
          </div>
        )}
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60 scrollbar-none">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SectionTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-surface-elevated/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PERSONAL & BIO */}
      {/* =================================================================== */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Card 1: Official Brand Logo & Visual Identity */}
          <Card variant="glass" padding="lg" hoverLift={false} className="space-y-5 border-violet-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
                    Official MP Brand Logo &amp; Identity
                  </h3>
                  <Badge variant="primary" className="border-violet-500/40 text-violet-300 text-[10px]">
                    Owner-Only
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-1">
                  Primary brand emblem displayed across Main Navbar (top-left), Mobile Menu, Footer, Website Loading Screen, and Favicons.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5 mr-1" />}
                >
                  Upload / Replace Logo
                </Button>
                {content.personal?.logoUrl && content.personal.logoUrl !== '/images/mp-logo.png' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const updated = {
                        ...content,
                        personal: {
                          ...content.personal,
                          logoUrl: '/images/mp-logo.png',
                        },
                      };
                      setContent(updated);
                      setHasUnsavedDraft(false);
                      await savePortfolioContent(updated);
                      toast.success('Reset to official repository logo (/images/mp-logo.png)');
                    }}
                    title="Reset to default logo asset"
                    className="text-xs text-muted hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Live Context Previews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preview 1: Main Navbar */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 flex flex-col justify-between space-y-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Main Navbar (Top-Left)
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 flex items-center gap-3">
                  <BrandLogo
                    src={content.personal?.logoUrl || '/images/mp-logo.png'}
                    size="md"
                    withGlow
                  />
                  <div>
                    <div className="font-display font-semibold text-sm text-foreground">
                      Mukesh <span className="text-violet-500">Pramanik</span>
                    </div>
                    <div className="text-[10px] text-muted font-mono">object-fit: contain</div>
                  </div>
                </div>
                <span className="text-[10px] text-muted">Clickable link to homepage with accessible alt text</span>
              </div>

              {/* Preview 2: Footer */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 flex flex-col justify-between space-y-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Footer (Compact)
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 flex items-center gap-2.5">
                  <BrandLogo
                    src={content.personal?.logoUrl || '/images/mp-logo.png'}
                    size="sm"
                    withGlow
                  />
                  <div className="font-display font-bold text-sm text-foreground">
                    Mukesh <span className="text-violet-500">Pramanik</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted">Scaled down version preserving proportions &amp; design</span>
              </div>

              {/* Preview 3: Favicon & Loading */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 flex flex-col justify-between space-y-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Favicon &amp; Loading Screen
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 flex items-center justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <BrandLogo
                      src={content.personal?.logoUrl || '/images/mp-logo.png'}
                      size="xs"
                    />
                    <span className="text-[9px] text-muted font-mono">24px Tab</span>
                  </div>
                  <div className="w-[1px] h-8 bg-border/60" />
                  <div className="flex flex-col items-center gap-1">
                    <BrandLogo
                      src={content.personal?.logoUrl || '/images/mp-logo.png'}
                      size="sm"
                    />
                    <span className="text-[9px] text-muted font-mono">32px Icon</span>
                  </div>
                  <div className="w-[1px] h-8 bg-border/60" />
                  <div className="flex flex-col items-center gap-1">
                    <BrandLogo
                      src={content.personal?.logoUrl || '/images/mp-logo.png'}
                      size="md"
                    />
                    <span className="text-[9px] text-muted font-mono">Loading</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted">Recognizable at all compact resolutions</span>
              </div>
            </div>

            {/* Asset specifications & Path */}
            <div className="p-3 rounded-xl bg-black/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-muted text-[11px] font-mono uppercase tracking-wider">Current Asset Path</div>
                <div className="font-mono text-violet-300 text-xs truncate max-w-md">
                  {content.personal?.logoUrl || '/images/mp-logo.png'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] bg-surface font-mono">
                  Silver &amp; Purple Theme
                </Badge>
                <Badge variant="default" className="text-[10px] bg-surface font-mono">
                  1:1 Ratio
                </Badge>
              </div>
            </div>
          </Card>

          {/* Card 2: Profile Photograph (Separate Asset from Brand Logo) */}
          <Card variant="glass" padding="lg" hoverLift={false} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
                  Profile Photograph (Personal Avatar)
                </h3>
                <p className="text-xs text-muted mt-1">
                  Your personal portrait photograph displayed in the About section and bio avatar circles. Kept strictly separate from the MP brand logo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5 mr-1" />}
                >
                  Upload Profile Photo
                </Button>
                {content.personal?.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const updated = {
                        ...content,
                        personal: {
                          ...content.personal,
                          avatarUrl: '',
                        },
                      };
                      setContent(updated);
                      setHasUnsavedDraft(false);
                      await savePortfolioContent(updated);
                      toast.success('Profile photo cleared and synchronized across the portfolio!');
                    }}
                    className="text-xs text-muted hover:text-red-400"
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 shrink-0">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden border border-border">
                  {content.personal?.avatarUrl ? (
                    <img
                      src={content.personal.avatarUrl}
                      alt={content.personal?.name || 'Mukesh Pramanik'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-2xl gradient-text">
                      MP
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <Input
                  label="Profile Photo URL or Path (Optional)"
                  value={content.personal?.avatarUrl || ''}
                  onChange={(e) => handleUpdatePersonal('avatarUrl', e.target.value)}
                  placeholder="https://... or /images/profile.jpg (leave empty for initials avatar)"
                />
                <p className="text-[11px] text-muted">
                  Note: Profile photograph and Brand Logo are stored and edited as independent assets.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Personal Information & Bio */}
          <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-bold font-display text-foreground">
                  Personal Information &amp; Bio
                </h3>
                <p className="text-xs text-muted">
                  Primary identity attributes displayed across Hero, About, and Footer.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={isSaving}
                onClick={handleSaveDraft}
                leftIcon={<Save className="w-3.5 h-3.5 mr-1" />}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={content.personal?.name || ''}
              onChange={(e) => handleUpdatePersonal('name', e.target.value)}
              placeholder="Mukesh Pramanik"
            />

            <div>
              <Input
                label="Professional Email *"
                value={content.personal?.email || ''}
                onChange={(e) => handleUpdatePersonal('email', e.target.value)}
                placeholder="YOUR_EMAIL_HERE"
              />
              {isPlaceholder(content.personal?.email) && (
                <span className="text-[10px] text-amber-400 mt-1 block">
                  ⚠️ Placeholder: Please replace with your actual email address
                </span>
              )}
            </div>

            <div>
              <Input
                label="Phone Number (Optional)"
                value={content.personal?.phone || ''}
                onChange={(e) => handleUpdatePersonal('phone', e.target.value)}
                placeholder="YOUR_PHONE_HERE"
              />
              {isPlaceholder(content.personal?.phone) && (
                <span className="text-[10px] text-amber-400 mt-1 block">
                  ⚠️ Placeholder: Replace or leave empty
                </span>
              )}
            </div>

            <div>
              <Input
                label="Location *"
                value={content.personal?.location || ''}
                onChange={(e) => handleUpdatePersonal('location', e.target.value)}
                placeholder="YOUR_CITY_HERE, India"
              />
              {isPlaceholder(content.personal?.location) && (
                <span className="text-[10px] text-amber-400 mt-1 block">
                  ⚠️ Placeholder: Enter your city and state
                </span>
              )}
            </div>

            <Input
              label="Academic Tagline"
              value={content.personal?.tagline || ''}
              onChange={(e) => handleUpdatePersonal('tagline', e.target.value)}
              placeholder="B.Tech CSE Student | Data Analytics Enthusiast"
            />

            <Input
              label="Years of Study / Batch"
              value={content.personal?.yearsOfStudy || ''}
              onChange={(e) => handleUpdatePersonal('yearsOfStudy', e.target.value)}
              placeholder="2nd Year (2023–2027)"
            />
          </div>

          <Input
            label="Biography (Short Hero Bio) *"
            inputType="textarea"
            rows={3}
            value={content.personal?.bio || ''}
            onChange={(e) => handleUpdatePersonal('bio', e.target.value)}
            placeholder="A passionate Computer Science Engineering student..."
          />

          <Input
            label="Professional Summary (About Section Summary) *"
            inputType="textarea"
            rows={4}
            value={content.personal?.summary || ''}
            onChange={(e) => handleUpdatePersonal('summary', e.target.value)}
            placeholder="Aspiring software developer and data analyst..."
          />

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="availableForHire"
              checked={content.personal?.availableForHire ?? true}
              onChange={(e) => handleUpdatePersonal('availableForHire', e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 bg-surface border-border focus:ring-violet-500"
            />
            <label htmlFor="availableForHire" className="text-xs text-foreground cursor-pointer">
              Mark as <strong>&quot;Available for Opportunities &amp; Internships&quot;</strong> in Hero status badge
            </label>
          </div>
        </Card>
      </div>
    )}

      {/* =================================================================== */}
      {/* TAB: CORE FIELDS OF INTEREST */}
      {/* =================================================================== */}
      {activeTab === 'interests' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold font-display text-foreground">
                  Core Fields of Interest
                </h3>
                <Badge variant="primary" size="sm">
                  {(content.interests || DEFAULT_INTERESTS).length} Tags
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1">
                Manage the highlighted interest tags displayed in your public About/Profile section. Reorder using up/down controls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetInterests}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                title="Reset to default 6 interest tags"
              >
                Reset Defaults
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={handleSaveInterests}
                leftIcon={<Save className="w-3.5 h-3.5 mr-1" />}
              >
                {isSaving ? 'Saving...' : 'Save Interests'}
              </Button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="p-4 rounded-xl bg-surface/80 border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-accent" />
                Live Portfolio Preview (About Section)
              </span>
              <span className="text-[11px] text-muted">
                Alternates primary and accent badges automatically
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(content.interests || DEFAULT_INTERESTS).map((interest: string, i: number) => (
                <Badge
                  key={`${interest}-${i}`}
                  variant={i % 2 === 0 ? 'primary' : 'accent'}
                  size="md"
                  className="cursor-default"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Add New Interest Input Form */}
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/80">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-primary" />
              Add New Field of Interest
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex-1 w-full">
                <Input
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="e.g. Cloud Computing, Big Data Engineering, Deep Learning..."
                />
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={isSaving || !newInterestInput.trim()}
                onClick={handleAddInterest}
                leftIcon={<Plus className="w-4 h-4 mr-1" />}
                className="w-full sm:w-auto shrink-0"
              >
                {isSaving ? 'Adding...' : 'Add Interest'}
              </Button>
            </div>
          </div>

          {/* Interest List with Reorder Up/Down & Edit/Delete */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted font-mono px-1">
              <span>ORDER &amp; INTEREST NAME</span>
              <span>ACTIONS</span>
            </div>

            {(content.interests || DEFAULT_INTERESTS).map((interest: string, idx: number, arr: string[]) => {
              const isEditingThis = editingInterestIndex === idx;
              return (
                <div
                  key={`${interest}-${idx}`}
                  className="p-3 sm:p-4 rounded-xl bg-surface-elevated/70 border border-border/80 hover:border-violet-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Position Badge */}
                    <span className="w-7 h-7 rounded-lg bg-surface border border-border/70 flex items-center justify-center text-xs font-mono font-bold text-muted shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Up / Down Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveInterest(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          idx === 0
                            ? 'opacity-30 cursor-not-allowed border-transparent text-muted'
                            : 'border-border/60 hover:border-primary/50 text-muted hover:text-primary hover:bg-surface'
                        }`}
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveInterest(idx, 'down')}
                        disabled={idx === arr.length - 1}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          idx === arr.length - 1
                            ? 'opacity-30 cursor-not-allowed border-transparent text-muted'
                            : 'border-border/60 hover:border-primary/50 text-muted hover:text-primary hover:bg-surface'
                        }`}
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title or Inline Edit Input */}
                    {isEditingThis ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingInterestValue}
                          onChange={(e) => setEditingInterestValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditedInterest();
                            } else if (e.key === 'Escape') {
                              setEditingInterestIndex(null);
                            }
                          }}
                          autoFocus
                          className="py-1 text-sm"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveEditedInterest}
                          className="shrink-0"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingInterestIndex(null)}
                          className="shrink-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {interest}
                        </span>
                        <Badge
                          variant={idx % 2 === 0 ? 'primary' : 'accent'}
                          size="sm"
                        >
                          {idx % 2 === 0 ? 'Primary' : 'Accent'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  {!isEditingThis && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInterestIndex(idx);
                          setEditingInterestValue(interest);
                        }}
                        className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors"
                        title="Edit Interest Name"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInterest(idx)}
                        className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-surface transition-colors"
                        title="Delete Interest"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SKILLS */}
      {/* =================================================================== */}
      {activeTab === 'skills' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Technical Skills &amp; Proficiency ({content.skills?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Manage categories, display order, and animated progress bar percentages.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingSkill({
                  index: -1,
                  data: {
                    id: Date.now(),
                    name: '',
                    category: 'Programming & Database',
                    proficiency: 80,
                    hasProficiency: false,
                    icon: 'code',
                    displayOrder: (content.skills?.length || 0) + 1,
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add New Skill
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(content.skills || []).map((skill: any, idx: number) => {
              const hasProf = typeof skill.proficiency === 'number' && skill.proficiency > 0;
              return (
                <div
                  key={skill.id || idx}
                  className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-between group hover:border-violet-500/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{skill.name}</span>
                      <Badge variant="default" size="sm" className="text-[10px] truncate max-w-[150px]">
                        {skill.category}
                      </Badge>
                    </div>
                    {hasProf ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">{skill.proficiency}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-violet-300/80">Competency (No % level)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSkill({
                          index: idx,
                          data: {
                            ...skill,
                            hasProficiency: hasProf,
                          },
                        })
                      }
                      className="p-1.5 rounded-lg text-muted hover:text-cyan-400 hover:bg-surface transition-colors"
                      title="Edit skill"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          section: 'skills',
                          index: idx,
                          title: skill.name,
                        })
                      }
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PROJECTS */}
      {/* =================================================================== */}
      {activeTab === 'projects' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Featured Projects ({content.projects?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Manage showcases, case study markdown descriptions, repository links, and demo URLs.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const initialCategory = 'Web Development';
                const initialAutoImage = getAutoProjectImage({
                  category: initialCategory,
                  id: Date.now(),
                });
                setEditingProject({
                  index: -1,
                  data: {
                    id: Date.now(),
                    title: '',
                    slug: '',
                    description: '',
                    longDescription: '',
                    category: initialCategory,
                    technologies: ['React', 'TypeScript'],
                    githubUrl: 'https://github.com/Mukeshpramanik',
                    liveUrl: '',
                    imageUrl: initialAutoImage,
                    featured: true,
                    displayOrder: (content.projects?.length || 0) + 1,
                    createdAt: new Date().toISOString().split('T')[0],
                  },
                });
              }}
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add Project
            </Button>
          </div>

          <div className="space-y-3">
            {(content.projects || []).map((project: any, idx: number) => (
              <div
                key={project.id || idx}
                className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 max-w-xl">
                  {project.imageUrl ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-border/80 bg-surface shadow-sm">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded-lg shrink-0 border border-border/80 bg-surface flex items-center justify-center text-muted">
                      <FolderGit2 className="w-5 h-5 text-violet-400" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{project.title}</span>
                      <Badge variant="default" size="sm">
                        {project.category}
                      </Badge>
                      {project.featured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted line-clamp-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(project.technologies || []).map((tech: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border font-mono text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingProject({ index: idx, data: { ...project } })}
                    leftIcon={<Edit2 className="w-3.5 h-3.5 mr-1" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget({
                        section: 'projects',
                        index: idx,
                        title: project.title,
                      });
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 4: EDUCATION */}
      {/* =================================================================== */}
      {activeTab === 'education' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Education Timeline
              </h3>
              <p className="text-xs text-muted">
                University, degree, field of study, graduation year, and academic summary.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingEducation({
                  index: -1,
                  data: {
                    id: Date.now(),
                    institution: 'YOUR_COLLEGE_NAME_HERE',
                    degree: 'B.Tech',
                    field: 'Computer Science Engineering',
                    startYear: '2023',
                    endYear: '2027',
                    gpa: 0,
                    description: '',
                    displayOrder: (content.education?.length || 0) + 1,
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add Education
            </Button>
          </div>

          <div className="space-y-3">
            {(content.education || []).map((edu: any, idx: number) => (
              <div
                key={edu.id || idx}
                className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {edu.degree} in {edu.field}
                    </span>
                    <Badge variant="default" size="sm">
                      {edu.startYear} – {edu.endYear}
                    </Badge>
                  </div>
                  <p className="text-xs text-cyan-400 font-medium">
                    {edu.institution}
                    {isPlaceholder(edu.institution) && (
                      <span className="ml-2 text-amber-400 font-normal">
                        ⚠️ (Placeholder needs update)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted mt-1">{edu.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const eduData = { ...edu };
                      if (eduData.institution === 'YOUR_COLLEGE_NAME_HERE') {
                        eduData.institution = '';
                      }
                      setEditingEducation({ index: idx, data: eduData });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget({
                        section: 'education',
                        index: idx,
                        title: `${edu.degree} - ${edu.institution}`,
                      });
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 5: EXPERIENCE & INTERNSHIPS */}
      {/* =================================================================== */}
      {activeTab === 'experience' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Work Experience &amp; Internships ({content.experience?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Add verified corporate roles or internships when you complete them.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingExperience({
                  index: -1,
                  data: {
                    id: Date.now(),
                    role: '',
                    company: '',
                    location: 'India',
                    startDate: '2025-06',
                    endDate: 'Present',
                    current: true,
                    description: '',
                    skills: [],
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add Experience
            </Button>
          </div>

          {(content.experience || []).length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-elevated/40 border border-dashed border-border/80 space-y-2">
              <Briefcase className="w-8 h-8 text-muted mx-auto" />
              <p className="text-sm font-medium text-foreground">No work experience entries yet</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                In strict accordance with profile integrity, no work experience has been fabricated. As a 2nd year B.Tech student, your portfolio highlights academic projects. Add entries here whenever you complete an internship!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.experience.map((exp: any, idx: number) => (
                <div
                  key={exp.id || idx}
                  className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-foreground">{exp.role}</span>
                    <p className="text-xs text-cyan-400">{exp.company} &bull; {exp.location}</p>
                    <p className="text-xs text-muted">{exp.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingExperience({ index: idx, data: { ...exp } })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget({
                          section: 'experience',
                          index: idx,
                          title: `${exp.role} at ${exp.company}`,
                        });
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 6: CERTIFICATIONS & AWARDS */}
      {/* =================================================================== */}
      {activeTab === 'certifications' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Certificates &amp; Achievements ({content.certifications?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Add verified certifications, courses, and technical achievements.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingCertificate({
                  index: -1,
                  data: {
                    id: Date.now(),
                    name: '',
                    issuer: '',
                    issueDate: '2024-05',
                    credentialUrl: '',
                    credentialId: '',
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add Certificate
            </Button>
          </div>

          {(content.certifications || []).length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-elevated/40 border border-dashed border-border/80 space-y-2">
              <Award className="w-8 h-8 text-muted mx-auto" />
              <p className="text-sm font-medium text-foreground">No certificates added yet</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                No certificates were fabricated. Click &quot;Add Certificate&quot; above to add your Python, SQL, or Data Analytics credentials whenever you receive them!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.certifications.map((cert: any, idx: number) => (
                <div
                  key={cert.id || idx}
                  className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-foreground">{cert.name}</span>
                    <p className="text-xs text-cyan-400">{cert.issuer} &bull; {cert.issueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingCertificate({ index: idx, data: { ...cert } })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget({
                          section: 'certifications',
                          index: idx,
                          title: cert.name,
                        });
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB: ACHIEVEMENTS & HONORS */}
      {/* =================================================================== */}
      {activeTab === 'achievements' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Achievements &amp; Honors ({content.achievements?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Add hackathons, coding contests, academic recognitions, and competitive milestones.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingAchievement({
                  index: -1,
                  data: {
                    id: Date.now(),
                    title: '',
                    description: '',
                    category: 'Competition',
                    date: '2024',
                    displayOrder: (content.achievements?.length || 0) + 1,
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add Achievement
            </Button>
          </div>

          {(content.achievements || []).length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-elevated/40 border border-dashed border-border/80 space-y-2">
              <Sparkles className="w-8 h-8 text-muted mx-auto text-cyan-400" />
              <p className="text-sm font-medium text-foreground">No achievements added yet</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                Click &quot;Add Achievement&quot; above to add your hackathon rankings, coding competition achievements, or academic awards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.achievements.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{item.title}</span>
                      <Badge variant="primary" size="sm">{item.category}</Badge>
                    </div>
                    <p className="text-xs text-muted">{item.description}</p>
                    <p className="text-[11px] font-mono text-cyan-400">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingAchievement({ index: idx, data: { ...item } })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget({
                          section: 'achievements',
                          index: idx,
                          title: item.title,
                        });
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 7: RESUME PDF */}
      {/* =================================================================== */}
      {activeTab === 'resume' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-lg font-bold font-display text-foreground">
              Resume PDF Management
            </h3>
            <p className="text-xs text-muted">
              Configure resume file path and instructions for replacing the PDF asset.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase text-muted">Current Resume Path</p>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {content.personal?.resumeUrl || '/resume.pdf'}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              When visitors click <strong>&quot;Resume&quot;</strong> in the About section or press <strong>Cmd+K &gt; Download Resume</strong>, the browser downloads or views this file.
            </p>

            <div className="pt-2">
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${content.personal?.resumeUrl || '/resume.pdf'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <span>View current resume in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/25 text-xs text-foreground leading-relaxed">
            <p className="font-bold text-violet-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-violet-400" />
              How to replace your resume PDF:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-muted">
              <li>Export or compile your resume as a PDF file named <code className="text-cyan-400 font-mono">resume.pdf</code>.</li>
              <li>Place it directly inside your local repository folder: <code className="text-cyan-400 font-mono">frontend/public/resume.pdf</code> (replacing the placeholder).</li>
              <li>Commit and push to GitHub: <code className="text-cyan-400 font-mono">git add frontend/public/resume.pdf &amp;&amp; git commit -m &quot;Update resume PDF&quot; &amp;&amp; git push</code>.</li>
              <li>GitHub Actions will automatically redeploy the new resume for free!</li>
            </ol>
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 8: CHATBOT KNOWLEDGE */}
      {/* =================================================================== */}
      {activeTab === 'chatbot' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Ask Mukesh AI Knowledge Base ({content.chatbotKnowledge?.length || 0})
              </h3>
              <p className="text-xs text-muted">
                Edit the local pattern-matching answers used by the client-side browser chatbot (₹0 cost).
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingChatbot({
                  index: -1,
                  data: {
                    category: 'custom',
                    keywords: ['topic'],
                    patterns: ['custom question'],
                    response: 'My answer goes here...',
                    suggestedQuestions: ['What are your skills?'],
                  },
                })
              }
              leftIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
            >
              Add AI Topic
            </Button>
          </div>

          <div className="space-y-3">
            {(content.chatbotKnowledge || []).map((entry: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm" className="capitalize font-mono">
                      {entry.category}
                    </Badge>
                    <span className="text-xs text-muted font-mono">
                      Keywords: {(entry.keywords || []).slice(0, 5).join(', ')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                    {entry.response}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingChatbot({ index: idx, data: { ...entry } })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget({
                        section: 'chatbot',
                        index: idx,
                        title: `Chatbot topic: ${entry.category}`,
                      });
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 9: WEBSITE TEXT & SOCIALS */}
      {/* =================================================================== */}
      {activeTab === 'website' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-lg font-bold font-display text-foreground">
              Website Copy &amp; Social Links
            </h3>
            <p className="text-xs text-muted">
              Configure URLs and editorial call-to-action text across the public portfolio.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Social Media &amp; Profiles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="GitHub Profile URL *"
                  value={content.personal?.socialLinks?.github || ''}
                  onChange={(e) => handleUpdateSocial('github', e.target.value)}
                  placeholder="https://github.com/Mukeshpramanik"
                />
                {isPlaceholder(content.personal?.socialLinks?.github) && (
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    ⚠️ Placeholder: Enter your actual GitHub URL
                  </span>
                )}
              </div>

              <div>
                <Input
                  label="LinkedIn Profile URL *"
                  value={content.personal?.socialLinks?.linkedin || ''}
                  onChange={(e) => handleUpdateSocial('linkedin', e.target.value)}
                  placeholder="YOUR_LINKEDIN_URL_HERE"
                />
                {isPlaceholder(content.personal?.socialLinks?.linkedin) && (
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    ⚠️ Placeholder: Enter your actual LinkedIn URL
                  </span>
                )}
              </div>

              <Input
                label="Twitter / X Profile URL"
                value={content.personal?.socialLinks?.twitter || ''}
                onChange={(e) => handleUpdateSocial('twitter', e.target.value)}
                placeholder="https://twitter.com/mukeshpramanik"
              />

              <Input
                label="Email Mailto Link"
                value={content.personal?.socialLinks?.email || ''}
                onChange={(e) => handleUpdateSocial('email', e.target.value)}
                placeholder="mailto:YOUR_EMAIL_HERE"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/60">
            <h4 className="text-xs font-mono uppercase tracking-wider text-violet-400">
              Headlines &amp; Call To Actions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hero Greeting"
                value={content.websiteText?.heroGreeting || ''}
                onChange={(e) => handleUpdateWebsiteText('heroGreeting', e.target.value)}
                placeholder="Hello, I'm"
              />
              <Input
                label="Hero Tagline"
                value={content.websiteText?.heroTagline || ''}
                onChange={(e) => handleUpdateWebsiteText('heroTagline', e.target.value)}
                placeholder="B.Tech CSE Student | Data Analytics..."
              />
              <Input
                label="Hero CTA 1 (Projects)"
                value={content.websiteText?.heroCtaWork || ''}
                onChange={(e) => handleUpdateWebsiteText('heroCtaWork', e.target.value)}
                placeholder="View My Work"
              />
              <Input
                label="Hero CTA 2 (Contact)"
                value={content.websiteText?.heroCtaContact || ''}
                onChange={(e) => handleUpdateWebsiteText('heroCtaContact', e.target.value)}
                placeholder="Get in Touch"
              />
            </div>

            <Input
              label="About Section Main Heading"
              value={content.websiteText?.aboutHeading || ''}
              onChange={(e) => handleUpdateWebsiteText('aboutHeading', e.target.value)}
              placeholder="Engineering student driven by data, curiosity, and code."
            />

            <Input
              label="Contact Section Subtitle"
              value={content.websiteText?.contactSubtitle || ''}
              onChange={(e) => handleUpdateWebsiteText('contactSubtitle', e.target.value)}
              placeholder="Have a question or internship opportunity..."
            />
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 10: EXPORT & PUBLISH */}
      {/* =================================================================== */}
      {activeTab === 'export' && (
        <Card variant="glass" padding="lg" hoverLift={false} className="space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-lg font-bold font-display text-foreground">
              Export Updated Content &amp; Publishing Guide
            </h3>
            <p className="text-xs text-muted">
              Because this website is hosted statically for free on GitHub Pages, updates become live when you replace the repository file and push to GitHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-violet-400" />
                Step 1: Download Updated JSON
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Download your edited content file. It includes all your latest changes, new projects, skills, education, and chatbot knowledge.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleExportJson}
                leftIcon={<Download className="w-4 h-4 mr-1" />}
                className="w-full shadow-violet-600/30"
              >
                Download portfolioContent.json
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Restore / Import Content
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Already have an exported JSON file? Upload it to reload all your saved details back into this editor.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4 mr-1" />}
                className="w-full"
              >
                Choose JSON File
              </Button>
            </div>
          </div>

          {/* Publishing Walkthrough */}
          <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-border/80 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              How to Publish Changes to Your Live GitHub Pages Website (₹0)
            </h4>

            <div className="space-y-3 text-xs text-muted">
              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-mono font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Copy the downloaded <code>portfolioContent.json</code> into your repository at:{' '}
                  <code className="text-cyan-400 font-mono">frontend/src/data/portfolioContent.json</code>.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-mono font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  (Optional) If you updated your resume, save it at:{' '}
                  <code className="text-cyan-400 font-mono">frontend/public/resume.pdf</code>.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-mono font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p>In your terminal, commit and push changes to GitHub:</p>
                  <pre className="mt-1.5 p-3 rounded-xl bg-black/60 border border-border/60 font-mono text-cyan-400 text-[11px] overflow-x-auto">
git add frontend/src/data/portfolioContent.json
git commit -m &quot;feat: update portfolio content via content manager&quot;
git push origin main</pre>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-mono font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <p>
                  <strong>Done!</strong> GitHub Actions will build the static pages and deploy the update to your free GitHub Pages URL in ~2 minutes with zero cost.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* =================================================================== */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to delete <strong>&quot;{deleteTarget?.title}&quot;</strong>?
          </p>
          <p className="text-[11px] text-amber-400">
            This item will be removed from your active working draft. The live website will reflect this deletion once you export and commit the updated JSON file.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL: EDIT SKILL */}
      {/* =================================================================== */}
      {editingSkill && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSkill(null)}
          title={editingSkill.index === -1 ? 'Add New Skill' : 'Edit Skill'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Skill Name *"
              value={editingSkill.data.name}
              onChange={(e) =>
                setEditingSkill({
                  ...editingSkill,
                  data: { ...editingSkill.data, name: e.target.value },
                })
              }
              placeholder="e.g. Python, SQL, Pandas"
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Category *
              </label>
              <select
                value={editingSkill.data.category}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    data: { ...editingSkill.data, category: e.target.value },
                  })
                }
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-violet-500"
              >
                <option value="Programming & Database">Programming &amp; Database</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Data Visualization & Business Intelligence">Data Visualization &amp; Business Intelligence</option>
                <option value="Machine Learning & Artificial Intelligence">Machine Learning &amp; Artificial Intelligence</option>
                <option value="Tools & Technologies">Tools &amp; Technologies</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="skillHasProficiency"
                checked={!!editingSkill.data.hasProficiency}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    data: {
                      ...editingSkill.data,
                      hasProficiency: e.target.checked,
                      proficiency: e.target.checked ? (editingSkill.data.proficiency || 80) : undefined,
                    },
                  })
                }
                className="w-4 h-4 rounded text-violet-600 bg-surface border-border focus:ring-violet-500 cursor-pointer"
              />
              <label htmlFor="skillHasProficiency" className="text-xs text-foreground cursor-pointer select-none">
                Display numeric proficiency percentage (e.g. 85%)
              </label>
            </div>

            {editingSkill.data.hasProficiency && (
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-elevated/50 border border-border/60">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-foreground">Proficiency Level</label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {editingSkill.data.proficiency || 80}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={editingSkill.data.proficiency || 80}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      data: { ...editingSkill.data, proficiency: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingSkill(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const trimmedName = editingSkill.data.name.trim();
                  if (!trimmedName) {
                    toast.error('Skill name is required.');
                    return;
                  }

                  const currentSkills = content.skills || [];
                  const isDuplicate = currentSkills.some(
                    (s: any, idx: number) =>
                      idx !== editingSkill.index &&
                      s.name.trim().toLowerCase() === trimmedName.toLowerCase()
                  );

                  if (isDuplicate) {
                    toast.error(`A skill named "${trimmedName}" already exists. Duplicate skills are not allowed.`);
                    return;
                  }

                  const finalSkill: any = {
                    ...editingSkill.data,
                    name: trimmedName,
                  };

                  if (!editingSkill.data.hasProficiency) {
                    delete finalSkill.proficiency;
                  }
                  delete finalSkill.hasProficiency;

                  setContent((prev: any) => {
                    const skills = [...(prev.skills || [])];
                    if (editingSkill.index === -1) {
                      skills.push(finalSkill);
                    } else {
                      skills[editingSkill.index] = finalSkill;
                    }
                    return { ...prev, skills };
                  });
                  setHasUnsavedDraft(true);
                  setEditingSkill(null);
                  toast.success('Skill updated in draft. Click "Save Draft" to write to disk!');
                }}
              >
                Save Skill
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT PROJECT */}
      {/* =================================================================== */}
      {editingProject && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          title={editingProject.index === -1 ? 'Add New Project' : 'Edit Project'}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Project Title *"
                value={editingProject.data.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newSlug =
                    editingProject.index === -1
                      ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      : editingProject.data.slug;
                  // If new project and no custom uploaded photo, auto-update image
                  const isCustomUploaded = editingProject.data.imageUrl?.startsWith('data:');
                  const autoImage =
                    editingProject.index === -1 && !isCustomUploaded
                      ? getAutoProjectImage({ ...editingProject.data, title: newTitle }, { force: true })
                      : editingProject.data.imageUrl;
                  setEditingProject({
                    ...editingProject,
                    data: {
                      ...editingProject.data,
                      title: newTitle,
                      slug: newSlug,
                      imageUrl: autoImage,
                    },
                  });
                }}
                placeholder="e.g. Studexa CRUD App"
              />

              <Input
                label="URL Slug *"
                value={editingProject.data.slug}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    data: { ...editingProject.data, slug: e.target.value },
                  })
                }
                placeholder="studexa"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Category *
                </label>
                <select
                  value={editingProject.data.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const isCustomUploaded = editingProject.data.imageUrl?.startsWith('data:');
                    const autoImage =
                      editingProject.index === -1 && !isCustomUploaded
                        ? getAutoProjectImage({ ...editingProject.data, category: newCategory }, { force: true })
                        : editingProject.data.imageUrl;
                    setEditingProject({
                      ...editingProject,
                      data: {
                        ...editingProject.data,
                        category: newCategory,
                        imageUrl: autoImage,
                      },
                    });
                  }}
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-violet-500"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Automation">Automation</option>
                  <option value="Python Development">Python Development</option>
                  <option value="Database Management">Database Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input
                label="GitHub Repository URL"
                value={editingProject.data.githubUrl || ''}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    data: { ...editingProject.data, githubUrl: e.target.value },
                  })
                }
                placeholder="https://github.com/Mukeshpramanik"
              />
            </div>

            <Input
              label="Short Summary Description *"
              inputType="textarea"
              rows={2}
              value={editingProject.data.description}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  data: { ...editingProject.data, description: e.target.value },
                })
              }
              placeholder="Brief summary displayed on project card..."
            />

            <Input
              label="Technologies (Comma separated)"
              value={(editingProject.data.technologies || []).join(', ')}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  data: {
                    ...editingProject.data,
                    technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="Python, SQL, Pandas, Matplotlib"
            />

            {/* Project Card Visual Cover Image Section */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <label className="text-xs font-semibold text-foreground">
                      Project Card Visual Cover Image
                    </label>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    Automatically assigned from 13 bespoke local visuals based on title, category &amp; keywords.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const autoImg = getAutoProjectImage(editingProject.data, { force: true });
                      const presetMatch = PROJECT_IMAGE_PRESETS.find((p) => p.path === autoImg);
                      setEditingProject({
                        ...editingProject,
                        data: { ...editingProject.data, imageUrl: autoImg },
                      });
                      toast.success(`Auto-assigned: ${presetMatch ? presetMatch.name : 'Category Visual'}`);
                    }}
                    leftIcon={<Sparkles className="w-3 h-3 mr-1 text-cyan-400" />}
                    className="text-xs font-medium"
                    title="Re-evaluate title & category keywords and assign matching visual"
                  >
                    Auto-Assign
                  </Button>

                  <input
                    ref={projectImageInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    onChange={handleProjectImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => projectImageInputRef.current?.click()}
                    leftIcon={<Upload className="w-3 h-3 mr-1" />}
                    className="text-xs font-medium"
                    title="Upload custom screenshot from disk"
                  >
                    Upload
                  </Button>

                  {editingProject.data.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, imageUrl: '' },
                        })
                      }
                      className="text-xs text-red-400 hover:bg-red-500/10"
                      title="Clear image"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Preset Visuals Dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Choose from 13 Crafted Visual Presets (Optional)
                </label>
                <select
                  value={editingProject.data.imageUrl || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      data: { ...editingProject.data, imageUrl: e.target.value },
                    })
                  }
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Auto-Detected / Custom Image --</option>
                  {PROJECT_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.path}>
                      [{preset.category}] {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Custom Image URL, Data URI or Asset Path"
                value={editingProject.data.imageUrl || ''}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    data: { ...editingProject.data, imageUrl: e.target.value },
                  })
                }
                placeholder="e.g. /images/projects/studexa.svg or https://..."
              />

              {/* Live Preview of Card Header */}
              {editingProject.data.imageUrl && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                    <span className="uppercase">Card Header Preview</span>
                    <span className="text-cyan-400">object-fit: cover • responsive</span>
                  </div>
                  <div className="relative h-28 w-full rounded-lg overflow-hidden border border-border/80 bg-surface">
                    <img
                      src={editingProject.data.imageUrl}
                      alt="Project Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-black/60 pointer-events-none" />
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30">
                        {editingProject.data.category || 'Category'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-surface/90 border border-white/10 flex items-center justify-center text-violet-400">
                        <FolderGit2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono text-muted">Preview Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Detailed Case Study Markdown"
              inputType="textarea"
              rows={5}
              value={editingProject.data.longDescription}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  data: { ...editingProject.data, longDescription: e.target.value },
                })
              }
              placeholder="### Project Overview\n\nDetailed breakdown of features and architecture..."
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="projFeatured"
                checked={editingProject.data.featured ?? true}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    data: { ...editingProject.data, featured: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-violet-600 bg-surface border-border focus:ring-violet-500"
              />
              <label htmlFor="projFeatured" className="text-xs text-foreground cursor-pointer">
                Feature on Homepage
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!editingProject.data.title.trim()) {
                    toast.error('Project title is required.');
                    return;
                  }
                  const resolvedImage =
                    editingProject.data.imageUrl?.trim() ||
                    getAutoProjectImage(editingProject.data);

                  const finalProject = {
                    ...editingProject.data,
                    imageUrl: resolvedImage,
                  };

                  setContent((prev: any) => {
                    const projects = [...(prev.projects || [])];
                    if (editingProject.index === -1) {
                      projects.push(finalProject);
                    } else {
                      projects[editingProject.index] = finalProject;
                    }
                    return { ...prev, projects };
                  });
                  setHasUnsavedDraft(true);
                  setEditingProject(null);
                  toast.success('Project saved in draft. Click "Save Draft" to write to disk!');
                }}
              >
                Save Project
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT EDUCATION */}
      {/* =================================================================== */}
      {editingEducation && (
        <Modal
          isOpen={true}
          onClose={() => setEditingEducation(null)}
          title={editingEducation.index === -1 ? 'Add Education' : 'Edit Education'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Degree *"
              value={editingEducation.data.degree}
              onChange={(e) =>
                setEditingEducation({
                  ...editingEducation,
                  data: { ...editingEducation.data, degree: e.target.value },
                })
              }
              placeholder="B.Tech"
            />

            <Input
              label="Field of Study *"
              value={editingEducation.data.field}
              onChange={(e) =>
                setEditingEducation({
                  ...editingEducation,
                  data: { ...editingEducation.data, field: e.target.value },
                })
              }
              placeholder="Computer Science Engineering"
            />

            <Input
              label="Institution / College *"
              value={editingEducation.data.institution}
              onChange={(e) =>
                setEditingEducation({
                  ...editingEducation,
                  data: { ...editingEducation.data, institution: e.target.value },
                })
              }
              placeholder="e.g. SRM Institute of Science and Technology"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Year"
                value={editingEducation.data.startYear}
                onChange={(e) =>
                  setEditingEducation({
                    ...editingEducation,
                    data: { ...editingEducation.data, startYear: e.target.value },
                  })
                }
                placeholder="2023"
              />
              <Input
                label="End Year"
                value={editingEducation.data.endYear}
                onChange={(e) =>
                  setEditingEducation({
                    ...editingEducation,
                    data: { ...editingEducation.data, endYear: e.target.value },
                  })
                }
                placeholder="2027"
              />
            </div>

            <Input
              label="Description / Focus"
              inputType="textarea"
              rows={3}
              value={editingEducation.data.description}
              onChange={(e) =>
                setEditingEducation({
                  ...editingEducation,
                  data: { ...editingEducation.data, description: e.target.value },
                })
              }
              placeholder="Coursework in Data Structures, SQL, Python, and Machine Learning..."
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingEducation(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={async () => {
                  const education = [...(content.education || [])];
                  if (editingEducation.index === -1) {
                    education.push(editingEducation.data);
                  } else {
                    education[editingEducation.index] = editingEducation.data;
                  }
                  const updatedContent = { ...content, education };
                  selfSavedRef.current = updatedContent;
                  setContent(updatedContent);
                  setHasUnsavedDraft(false);
                  setEditingEducation(null);
                  setIsSaving(true);

                  try {
                    const result = await savePortfolioContent(updatedContent);
                    if (result.success) {
                      toast.success('Education record updated and synchronized immediately across your portfolio!');
                    } else {
                      toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
                    }
                  } catch (err: any) {
                    toast.error('Failed to save education: ' + err.message);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? 'Saving...' : 'Save Education'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT EXPERIENCE */}
      {/* =================================================================== */}
      {editingExperience && (
        <Modal
          isOpen={true}
          onClose={() => setEditingExperience(null)}
          title={editingExperience.index === -1 ? 'Add Experience' : 'Edit Experience'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Role / Title *"
              value={editingExperience.data.role}
              onChange={(e) =>
                setEditingExperience({
                  ...editingExperience,
                  data: { ...editingExperience.data, role: e.target.value },
                })
              }
              placeholder="e.g. Data Analytics Intern"
            />

            <Input
              label="Company / Organization *"
              value={editingExperience.data.company}
              onChange={(e) =>
                setEditingExperience({
                  ...editingExperience,
                  data: { ...editingExperience.data, company: e.target.value },
                })
              }
              placeholder="Company Name"
            />

            <Input
              label="Location"
              value={editingExperience.data.location}
              onChange={(e) =>
                setEditingExperience({
                  ...editingExperience,
                  data: { ...editingExperience.data, location: e.target.value },
                })
              }
              placeholder="India (or Remote)"
            />

            <Input
              label="Summary Description"
              inputType="textarea"
              rows={3}
              value={editingExperience.data.description}
              onChange={(e) =>
                setEditingExperience({
                  ...editingExperience,
                  data: { ...editingExperience.data, description: e.target.value },
                })
              }
              placeholder="Responsibilities, tools used, and results achieved..."
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingExperience(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setContent((prev: any) => {
                    const experience = [...(prev.experience || [])];
                    if (editingExperience.index === -1) {
                      experience.push(editingExperience.data);
                    } else {
                      experience[editingExperience.index] = editingExperience.data;
                    }
                    return { ...prev, experience };
                  });
                  setHasUnsavedDraft(true);
                  setEditingExperience(null);
                  toast.success('Experience updated in draft. Click "Save Draft" to write to disk!');
                }}
              >
                Save Experience
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT CERTIFICATE */}
      {/* =================================================================== */}
      {editingCertificate && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCertificate(null)}
          title={editingCertificate.index === -1 ? 'Add Certificate' : 'Edit Certificate'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Certificate Name *"
              value={editingCertificate.data.name}
              onChange={(e) =>
                setEditingCertificate({
                  ...editingCertificate,
                  data: { ...editingCertificate.data, name: e.target.value },
                })
              }
              placeholder="e.g. Python for Data Science"
            />

            <Input
              label="Issuing Organization *"
              value={editingCertificate.data.issuer}
              onChange={(e) =>
                setEditingCertificate({
                  ...editingCertificate,
                  data: { ...editingCertificate.data, issuer: e.target.value },
                })
              }
              placeholder="e.g. Coursera, Kaggle, IBM"
            />

            <Input
              label="Issue Date"
              value={editingCertificate.data.issueDate}
              onChange={(e) =>
                setEditingCertificate({
                  ...editingCertificate,
                  data: { ...editingCertificate.data, issueDate: e.target.value },
                })
              }
              placeholder="2024-05"
            />

            <Input
              label="Credential URL"
              value={editingCertificate.data.credentialUrl || ''}
              onChange={(e) =>
                setEditingCertificate({
                  ...editingCertificate,
                  data: { ...editingCertificate.data, credentialUrl: e.target.value },
                })
              }
              placeholder="https://coursera.org/verify/..."
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingCertificate(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setContent((prev: any) => {
                    const certifications = [...(prev.certifications || [])];
                    if (editingCertificate.index === -1) {
                      certifications.push(editingCertificate.data);
                    } else {
                      certifications[editingCertificate.index] = editingCertificate.data;
                    }
                    return { ...prev, certifications };
                  });
                  setHasUnsavedDraft(true);
                  setEditingCertificate(null);
                  toast.success('Certificate saved in draft. Click "Save Draft" to persist to disk.');
                }}
              >
                Save Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT ACHIEVEMENT */}
      {/* =================================================================== */}
      {editingAchievement && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAchievement(null)}
          title={editingAchievement.index === -1 ? 'Add Achievement & Honor' : 'Edit Achievement'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Achievement Title *"
              value={editingAchievement.data.title}
              onChange={(e) =>
                setEditingAchievement({
                  ...editingAchievement,
                  data: { ...editingAchievement.data, title: e.target.value },
                })
              }
              placeholder="e.g. 1st Place - Campus Hackathon 2024"
            />

            <Input
              label="Summary Description *"
              inputType="textarea"
              rows={3}
              value={editingAchievement.data.description}
              onChange={(e) =>
                setEditingAchievement({
                  ...editingAchievement,
                  data: { ...editingAchievement.data, description: e.target.value },
                })
              }
              placeholder="Brief description of the contest, ranking, or recognition..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Category *"
                value={editingAchievement.data.category}
                onChange={(e) =>
                  setEditingAchievement({
                    ...editingAchievement,
                    data: { ...editingAchievement.data, category: e.target.value },
                  })
                }
                placeholder="Competition, Hackathon, Academic, Recognition"
              />

              <Input
                label="Date *"
                value={editingAchievement.data.date}
                onChange={(e) =>
                  setEditingAchievement({
                    ...editingAchievement,
                    data: { ...editingAchievement.data, date: e.target.value },
                  })
                }
                placeholder="2024 (or May 2024)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingAchievement(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!editingAchievement.data.title.trim()) {
                    toast.error('Achievement title is required.');
                    return;
                  }
                  setContent((prev: any) => {
                    const achievements = [...(prev.achievements || [])];
                    if (editingAchievement.index === -1) {
                      achievements.push(editingAchievement.data);
                    } else {
                      achievements[editingAchievement.index] = editingAchievement.data;
                    }
                    return { ...prev, achievements };
                  });
                  setHasUnsavedDraft(true);
                  setEditingAchievement(null);
                  toast.success('Achievement saved in draft. Click "Save Draft" to persist to disk.');
                }}
              >
                Save Achievement
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT CHATBOT */}
      {/* =================================================================== */}
      {editingChatbot && (
        <Modal
          isOpen={true}
          onClose={() => setEditingChatbot(null)}
          title={editingChatbot.index === -1 ? 'Add AI Chatbot Topic' : 'Edit AI Chatbot Topic'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Category / Topic *"
              value={editingChatbot.data.category}
              onChange={(e) =>
                setEditingChatbot({
                  ...editingChatbot,
                  data: { ...editingChatbot.data, category: e.target.value.toLowerCase() },
                })
              }
              placeholder="e.g. skills, projects, hobbies"
            />

            <Input
              label="Keywords (Comma separated) *"
              value={(editingChatbot.data.keywords || []).join(', ')}
              onChange={(e) =>
                setEditingChatbot({
                  ...editingChatbot,
                  data: {
                    ...editingChatbot.data,
                    keywords: e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
                  },
                })
              }
              placeholder="python, code, programming, developer"
            />

            <Input
              label="Chatbot Response Answer *"
              inputType="textarea"
              rows={4}
              value={editingChatbot.data.response}
              onChange={(e) =>
                setEditingChatbot({
                  ...editingChatbot,
                  data: { ...editingChatbot.data, response: e.target.value },
                })
              }
              placeholder="Write the exact answer the Ask Mukesh AI chatbot should give..."
            />

            <Input
              label="Suggested Follow-up Questions (Comma separated)"
              value={(editingChatbot.data.suggestedQuestions || []).join(', ')}
              onChange={(e) =>
                setEditingChatbot({
                  ...editingChatbot,
                  data: {
                    ...editingChatbot.data,
                    suggestedQuestions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="What are your skills?, Tell me about Studexa"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={() => setEditingChatbot(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!editingChatbot.data.category.trim() || !editingChatbot.data.response.trim()) {
                    toast.error('Category and Response are required.');
                    return;
                  }
                  setContent((prev: any) => {
                    const chatbotKnowledge = [...(prev.chatbotKnowledge || [])];
                    if (editingChatbot.index === -1) {
                      chatbotKnowledge.push(editingChatbot.data);
                    } else {
                      chatbotKnowledge[editingChatbot.index] = editingChatbot.data;
                    }
                    return { ...prev, chatbotKnowledge };
                  });
                  setHasUnsavedDraft(true);
                  setEditingChatbot(null);
                  toast.success('Chatbot topic saved in draft. Click "Save Draft" to write to disk!');
                }}
              >
                Save Topic
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* MODAL: LIVE PREVIEW JSON */}
      {/* =================================================================== */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live JSON Content Preview"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted">
            This represents the exact data structure that will be exported to{' '}
            <code className="text-cyan-400 font-mono">portfolioContent.json</code>.
          </p>
          <pre className="p-4 rounded-xl bg-black/80 border border-border/70 font-mono text-[11px] text-cyan-300 max-h-[60vh] overflow-y-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportJson}>
              Export portfolioContent.json
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const PortfolioContentManager = React.memo(PortfolioContentManagerComponent);
export default PortfolioContentManager;
