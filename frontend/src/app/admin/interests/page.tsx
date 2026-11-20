'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Eye,
  Check,
  X,
  Sparkles,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePortfolioContent, savePortfolioContent, DEFAULT_INTERESTS } from '@/hooks/usePortfolioContent';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminInterestsPage() {
  const { content, interests: synchronizedInterests } = usePortfolioContent();
  const [interestList, setInterestList] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when synchronizedInterests updates from central hook
  useEffect(() => {
    if (synchronizedInterests && Array.isArray(synchronizedInterests)) {
      setInterestList(synchronizedInterests);
    } else {
      setInterestList(DEFAULT_INTERESTS);
    }
  }, [synchronizedInterests]);

  const handleAddInterest = useCallback(async () => {
    const trimmed = newInterestInput.trim();
    if (!trimmed) {
      toast.error('Please enter an interest name.');
      return;
    }

    const isDuplicate = interestList.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      toast.error(`"${trimmed}" is already in your Core Fields of Interest.`);
      return;
    }

    const updated = [...interestList, trimmed];
    setInterestList(updated);
    setNewInterestInput('');

    setIsSaving(true);
    try {
      const updatedContent = {
        ...content,
        interests: updated,
      };
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Added "${trimmed}" to Core Fields of Interest!`);
      } else {
        toast.error(`Notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to save interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, interestList, newInterestInput]);

  const handleStartEdit = useCallback((index: number, currentVal: string) => {
    setEditingIndex(index);
    setEditingValue(currentVal);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) {
      toast.error('Interest name cannot be empty.');
      return;
    }

    const isDuplicate = interestList.some(
      (item, i) => i !== editingIndex && item.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      toast.error(`Another interest named "${trimmed}" already exists.`);
      return;
    }

    const updated = [...interestList];
    updated[editingIndex] = trimmed;
    setInterestList(updated);
    setEditingIndex(null);
    setEditingValue('');

    setIsSaving(true);
    try {
      const updatedContent = {
        ...content,
        interests: updated,
      };
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Updated interest to "${trimmed}"!`);
      } else {
        toast.error(`Notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to update interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, editingIndex, editingValue, interestList]);

  const handleDelete = useCallback(async (index: number) => {
    const targetName = interestList[index];
    const updated = interestList.filter((_, i) => i !== index);
    setInterestList(updated);

    setIsSaving(true);
    try {
      const updatedContent = {
        ...content,
        interests: updated,
      };
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Removed "${targetName}" from Core Fields of Interest.`);
      } else {
        toast.error(`Notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to delete interest: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, interestList]);

  const handleMove = useCallback(async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === interestList.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...interestList];
    const temp = updated[targetIndex];
    updated[targetIndex] = updated[index];
    updated[index] = temp;

    setInterestList(updated);

    try {
      const updatedContent = {
        ...content,
        interests: updated,
      };
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(`Reordered "${updated[targetIndex]}"!`, { id: 'interest-reorder-toast' });
      }
    } catch (err: any) {
      toast.error('Failed to reorder: ' + err.message);
    }
  }, [content, interestList]);

  const handleResetToDefault = useCallback(async () => {
    if (
      window.confirm(
        'Reset Core Fields of Interest back to the default 6 academic tags?'
      )
    ) {
      setInterestList(DEFAULT_INTERESTS);
      setIsSaving(true);
      try {
        const updatedContent = {
          ...content,
          interests: DEFAULT_INTERESTS,
        };
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

  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      const updatedContent = {
        ...content,
        interests: interestList,
      };
      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success(
          'Core Fields of Interest saved successfully and synchronized across your portfolio!'
        );
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }
    } catch (err: any) {
      toast.error('Failed to save interests: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [content, interestList]);

  const handleExportJson = useCallback(() => {
    const fullContent = {
      ...content,
      interests: interestList,
    };
    const jsonStr = JSON.stringify(fullContent, null, 2);
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
  }, [content, interestList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Core Fields of Interest
            </h1>
            <Badge variant="primary" size="sm">
              {interestList.length} Tags
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1">
            Maintain the key technical interests and specializations displayed on your public About section.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={handleResetToDefault}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            title="Reset to default 6 interest tags"
          >
            Reset Defaults
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportJson}
            leftIcon={<Download className="w-4 h-4" />}
            title="Download portfolioContent.json for GitHub Pages deployment"
          >
            Export JSON
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAll}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* GitHub Pages Workflow Notice Card */}
      <Card variant="glass" padding="sm" hoverLift={false} className="border-border/70 bg-surface/60 text-xs text-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px] uppercase font-bold shrink-0">
            Publishing Note
          </span>
          <span className="leading-relaxed">
            In local dev, <strong>Save Changes</strong> writes to disk automatically. For GitHub Pages static hosting, click <strong>Export JSON</strong> and replace <code>src/data/portfolioContent.json</code> in your repository, then git push to deploy for all visitors.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs shrink-0 self-end sm:self-center"
        >
          Download JSON
        </Button>
      </Card>

      {/* Live Preview Card */}
      <Card variant="glass" padding="md" hoverLift={false} className="border-border/80 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-accent" />
            Live Preview in About Section
          </span>
          <span className="text-[11px] text-muted">
            Alternating Primary / Accent styling
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {interestList.length === 0 ? (
            <p className="text-xs text-muted italic">No interests added yet.</p>
          ) : (
            interestList.map((interest, i) => (
              <Badge
                key={`${interest}-${i}`}
                variant={i % 2 === 0 ? 'primary' : 'accent'}
                size="md"
                className="cursor-default"
              >
                {interest}
              </Badge>
            ))
          )}
        </div>
      </Card>

      {/* Add New Interest Form */}
      <Card variant="glass" padding="md" hoverLift={false} className="border-border/80">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-primary" />
          Add New Field of Interest
        </h3>
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
              placeholder="e.g. Cloud Computing, Big Data, Deep Learning, DevOps..."
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddInterest}
            isLoading={isSaving}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0"
          >
            Add Interest
          </Button>
        </div>
      </Card>

      {/* Interests List */}
      {interestList.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-violet-400" />}
          title="No interests configured"
          description="Add your first core field of interest above, or restore the default tags."
          action={{
            label: 'Restore Defaults',
            onClick: handleResetToDefault,
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted font-mono px-2">
            <span>ORDER &amp; INTEREST TITLE</span>
            <span>REORDER / ACTIONS</span>
          </div>

          {interestList.map((interest, idx) => {
            const isEditingThis = editingIndex === idx;

            return (
              <Card
                key={`${interest}-${idx}`}
                variant="glass"
                padding="md"
                className="border-border/70 hover:border-violet-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                      onClick={() => handleMove(idx, 'up')}
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
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === interestList.length - 1}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        idx === interestList.length - 1
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
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                          }
                        }}
                        autoFocus
                        className="py-1 text-sm"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="shrink-0"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
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
                      onClick={() => handleStartEdit(idx, interest)}
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors"
                      title="Edit Interest Name"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-surface transition-colors"
                      title="Delete Interest"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
