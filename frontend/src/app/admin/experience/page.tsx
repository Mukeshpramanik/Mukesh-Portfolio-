'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { experienceData } from '@/data/profile';
import type { Experience } from '@/types';
import {
  getAdminExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface ExperienceFormData {
  company: string;
  role: string;
  type: 'full-time' | 'internship' | 'freelance';
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
  technologies: string;
  displayOrder: number;
}

const emptyFormData: ExperienceFormData = {
  company: '',
  role: '',
  type: 'internship',
  startDate: '',
  endDate: '',
  current: false,
  location: 'Remote / India',
  description: '',
  technologies: '',
  displayOrder: 1,
};

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>(
    experienceData as unknown as Experience[]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminExperience();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setExperiences(res.data);
        }
      } catch {
        // Fallback to local experienceData
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
      displayOrder: experiences.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setFormData({
      company: exp.company || '',
      role: exp.role || '',
      type: exp.type || 'internship',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: Boolean(exp.current),
      location: exp.location || '',
      description: exp.description || '',
      technologies: Array.isArray(exp.technologies)
        ? exp.technologies.join(', ')
        : '',
      displayOrder: exp.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.company.trim() || !formData.role.trim()) {
      toast.error('Company and Role are required.');
      return;
    }
    if (!formData.startDate.trim()) {
      toast.error('Start date is required.');
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      type: formData.type,
      startDate: formData.startDate.trim(),
      endDate: formData.current ? undefined : formData.endDate.trim() || undefined,
      current: formData.current,
      location: formData.location.trim() || undefined,
      description: formData.description.trim(),
      technologies: techArray,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        try {
          await updateExperience(editingId, payload);
        } catch {
          // offline mode
        }

        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? { ...e, ...payload } : e))
        );
        toast.success('Experience record updated!');
      } else {
        const newId = `exp-${Date.now()}`;
        const newExp: Experience = {
          id: newId,
          ...payload,
        };

        try {
          await createExperience(payload);
        } catch {
          // offline mode
        }

        setExperiences((prev) => [newExp, ...prev]);
        toast.success('Experience record added!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteExperience(deleteTarget.id);
      } catch {
        // offline mode
      }

      setExperiences((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success('Experience deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete experience');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: Experience['type']) => {
    switch (type) {
      case 'full-time':
        return <Badge variant="primary" size="sm">Full-time</Badge>;
      case 'internship':
        return <Badge variant="accent" size="sm">Internship</Badge>;
      case 'freelance':
        return <Badge variant="warning" size="sm">Freelance</Badge>;
      default:
        return <Badge variant="default" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Experience & Internships
          </h1>
          <p className="text-sm text-muted mt-1">
            Showcase industry experience, internships, freelance, and engineering roles.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Experience
        </Button>
      </div>

      {/* List */}
      {experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-violet-400" />}
          title="No experience listed yet"
          description="Click 'Add Experience' to record your internships, freelance projects, or professional positions."
          action={{
            label: 'Add Experience',
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card
              key={exp.id}
              variant="glass"
              padding="md"
              className="border-border/70 hover:border-violet-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {exp.role}
                      </h3>
                      <span className="text-muted">at</span>
                      <span className="font-semibold text-violet-400">
                        {exp.company}
                      </span>
                      {getTypeBadge(exp.type)}
                      {exp.current && (
                        <Badge variant="success" size="sm" dot>
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted/90 pt-1 leading-relaxed max-w-2xl whitespace-pre-line">
                      {exp.description}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-[11px] rounded bg-surface-elevated text-muted border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(exp)}
                    className="p-2 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(exp)}
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
        title={editingId ? 'Edit Experience' : 'Add Experience Record'}
        description="Detail your role responsibilities, tech stack, and duration."
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company / Organization"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="e.g. Google, Tech Startup, Freelance"
            required
          />

          <Input
            label="Job Title / Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Python Developer Intern"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1.5">
              Employment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as ExperienceFormData['type'],
                })
              }
              className="w-full bg-surface-elevated/70 text-foreground border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g. Remote / Bangalore, India"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            placeholder="e.g. Jan 2024"
            required
          />

          <Input
            label="End Date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            placeholder="e.g. May 2024"
            disabled={formData.current}
            helperText={formData.current ? 'Currently employed here' : undefined}
          />
        </div>

        {/* Current toggle */}
        <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/40 border border-border cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.current}
            onChange={(e) =>
              setFormData({ ...formData, current: e.target.checked })
            }
            className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-surface border-border"
          />
          <div className="text-sm">
            <span className="font-medium text-foreground block">
              I currently work here
            </span>
            <span className="text-xs text-muted block">
              Displays &apos;Present&apos; as the end date
            </span>
          </div>
        </label>

        <Input
          label="Responsibilities & Description"
          inputType="textarea"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Summarize key tasks, impacts, data models designed, code delivered..."
          required
        />

        <Input
          label="Technologies & Tools Used (comma-separated)"
          value={formData.technologies}
          onChange={(e) =>
            setFormData({ ...formData, technologies: e.target.value })
          }
          placeholder="Python, Pandas, Docker, SQL"
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
              Delete Experience
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete experience record?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove the record for{' '}
            <strong className="text-foreground">
              {deleteTarget?.role} at {deleteTarget?.company}
            </strong>
            .
          </p>
        </div>
      </Modal>
    </div>
  );
}
