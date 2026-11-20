'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { achievementsData } from '@/data/profile';
import type { Achievement } from '@/types';
import {
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES = [
  'Hackathon',
  'Academic',
  'Coding Competition',
  'Open Source',
  'Leadership',
  'Honor & Award',
  'Other',
];

interface AchievementFormData {
  title: string;
  description: string;
  date: string;
  category: string;
  displayOrder: number;
}

const emptyFormData: AchievementFormData = {
  title: '',
  description: '',
  date: '',
  category: 'Hackathon',
  displayOrder: 1,
};

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(
    achievementsData as unknown as Achievement[]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminAchievements();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setAchievements(res.data);
        }
      } catch {
        // Fallback to local achievementsData
      } finally {
        setIsLoading(false);
      }
    };
    fetchRemote();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...emptyFormData,
      displayOrder: achievements.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Achievement) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      category: item.category || 'Hackathon',
      displayOrder: item.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and Description are required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date.trim(),
      category: formData.category,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        try {
          await updateAchievement(editingId, payload);
        } catch {
          // offline mode
        }

        setAchievements((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...payload } : a))
        );
        toast.success('Achievement updated!');
      } else {
        const newId = `ach-${Date.now()}`;
        const newEntry: Achievement = {
          id: newId,
          ...payload,
        };

        try {
          await createAchievement(payload);
        } catch {
          // offline mode
        }

        setAchievements((prev) => [...prev, newEntry]);
        toast.success('Achievement added!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteAchievement(deleteTarget.id);
      } catch {
        // offline mode
      }

      setAchievements((prev) =>
        prev.filter((a) => a.id !== deleteTarget.id)
      );
      toast.success('Achievement deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete achievement');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Honors & Achievements
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage awards, hackathon recognitions, competitive programming rankings, and honors.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Achievement
        </Button>
      </div>

      {/* List */}
      {achievements.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-amber-400" />}
          title="No achievements yet"
          description="Click 'Add Achievement' to showcase hackathon wins, scholarships, or academic honors."
          action={{
            label: 'Add Achievement',
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="space-y-4">
          {achievements.map((item) => (
            <Card
              key={item.id}
              variant="glass"
              padding="md"
              className="border-border/70 hover:border-violet-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Trophy className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <Badge variant="accent" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    {item.date && (
                      <p className="text-xs text-muted font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </p>
                    )}

                    <p className="text-xs text-muted/90 leading-relaxed max-w-2xl whitespace-pre-line pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        title={editingId ? 'Edit Achievement' : 'Add Achievement'}
        description="Fill in details about the recognition or award."
        isLoading={isSubmitting}
        size="md"
      >
        <Input
          label="Title of Award / Recognition"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. 1st Place - University Hackathon 2024"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-surface-elevated/70 text-foreground border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date / Year"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="e.g. Oct 2024"
          />
        </div>

        <Input
          label="Description & Highlights"
          inputType="textarea"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Briefly describe what you achieved, team size, project, or competition scale..."
          required
        />

        <Input
          label="Display Order"
          type="number"
          value={formData.displayOrder}
          onChange={(e) =>
            setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
          }
          min={1}
        />
      </FormModal>

      {/* Delete Modal */}
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
              Delete Achievement
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete achievement record?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove{' '}
            <strong className="text-foreground">
              {deleteTarget?.title}
            </strong>{' '}
            from your portfolio.
          </p>
        </div>
      </Modal>
    </div>
  );
}
