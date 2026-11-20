'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  User,
  Building,
  Quote,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { testimonialsData } from '@/data/profile';
import type { Testimonial } from '@/types';
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface TestimonialFormData {
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl: string;
  visible: boolean;
  displayOrder: number;
}

const emptyFormData: TestimonialFormData = {
  name: '',
  role: '',
  company: '',
  content: '',
  avatarUrl: '',
  visible: true,
  displayOrder: 1,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    testimonialsData as unknown as Testimonial[]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminTestimonials();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setTestimonials(res.data);
        }
      } catch {
        // Fallback to local testimonialsData
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
      displayOrder: testimonials.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      company: item.company || '',
      content: item.content || '',
      avatarUrl: item.avatarUrl || '',
      visible: Boolean(item.visible),
      displayOrder: item.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item: Testimonial) => {
    const newVisible = !item.visible;
    // Optimistic UI update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, visible: newVisible } : t))
    );

    try {
      await updateTestimonial(item.id, { visible: newVisible });
      toast.success(
        `Testimonial by ${item.name} is now ${newVisible ? 'visible' : 'hidden'}.`
      );
    } catch {
      // offline mode success notification
      toast.success(`Updated visibility locally.`);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Author Name and Testimonial Quote are required.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      company: formData.company.trim(),
      content: formData.content.trim(),
      avatarUrl: formData.avatarUrl.trim() || undefined,
      visible: formData.visible,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        try {
          await updateTestimonial(editingId, payload);
        } catch {
          // offline mode
        }

        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
        );
        toast.success('Testimonial updated!');
      } else {
        const newId = `test-${Date.now()}`;
        const newEntry: Testimonial = {
          id: newId,
          ...payload,
        };

        try {
          await createTestimonial(payload);
        } catch {
          // offline mode
        }

        setTestimonials((prev) => [...prev, newEntry]);
        toast.success('Testimonial added!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteTestimonial(deleteTarget.id);
      } catch {
        // offline mode
      }

      setTestimonials((prev) =>
        prev.filter((t) => t.id !== deleteTarget.id)
      );
      toast.success('Testimonial deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete testimonial');
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
            Recommendations & Testimonials
          </h1>
          <p className="text-sm text-muted mt-1">
            Display peer reviews, professor endorsements, and colleague feedback.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Testimonial
        </Button>
      </div>

      {/* List */}
      {testimonials.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="w-8 h-8 text-cyan-400" />}
          title="No testimonials yet"
          description="Add recommendations from professors, mentors, or team members."
          action={{
            label: 'Add Testimonial',
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((item) => (
            <Card
              key={item.id}
              variant="glass"
              padding="md"
              className="border-border/70 hover:border-violet-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                      {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted">
                        {item.role}
                        {item.company ? ` at ${item.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.visible
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-muted hover:bg-surface-elevated'
                      }`}
                      title={item.visible ? 'Hide from public view' : 'Make visible'}
                    >
                      {item.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative pl-4 border-l-2 border-violet-500/30 pt-1">
                  <Quote className="w-4 h-4 text-violet-400/40 absolute -top-1 -left-2.5 bg-surface" />
                  <p className="text-xs text-muted/90 italic leading-relaxed">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted">
                <span>Display Order: #{item.displayOrder}</span>
                <Badge
                  variant={item.visible ? 'success' : 'default'}
                  size="sm"
                  dot={item.visible}
                >
                  {item.visible ? 'Visible on Portfolio' : 'Hidden'}
                </Badge>
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
        title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
        description="Share words of recommendation from mentors and collaborators."
        isLoading={isSubmitting}
        size="md"
      >
        <Input
          label="Author Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Dr. Ramesh Kumar"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Role / Title"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Professor & Dept Head"
          />

          <Input
            label="Company / University"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="e.g. SRM University"
          />
        </div>

        <Input
          label="Testimonial Quote"
          inputType="textarea"
          rows={4}
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Quote or endorsement text..."
          required
        />

        <Input
          label="Avatar Image URL (optional)"
          value={formData.avatarUrl}
          onChange={(e) =>
            setFormData({ ...formData, avatarUrl: e.target.value })
          }
          placeholder="https://.../avatar.jpg"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) =>
              setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
            }
            min={1}
          />

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) =>
                  setFormData({ ...formData, visible: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-surface border-border"
              />
              <span className="font-medium text-foreground">Visible on site</span>
            </label>
          </div>
        </div>
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
              Delete Testimonial
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete testimonial from {deleteTarget?.name}?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove this recommendation from your portfolio.
          </p>
        </div>
      </Modal>
    </div>
  );
}
