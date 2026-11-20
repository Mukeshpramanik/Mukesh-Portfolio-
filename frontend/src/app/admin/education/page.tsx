'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building,
  BookOpen,
  Award,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Education } from '@/types';
import { usePortfolioContent, savePortfolioContent } from '@/hooks/usePortfolioContent';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface EducationFormData {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  gpa: string;
  description: string;
  displayOrder: number;
}

const emptyFormData: EducationFormData = {
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  gpa: '',
  description: '',
  displayOrder: 1,
};

export default function AdminEducationPage() {
  const { content, education: synchronizedEducation } = usePortfolioContent();
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state whenever synchronizedEducation from centralized hook changes
  useEffect(() => {
    if (synchronizedEducation && Array.isArray(synchronizedEducation)) {
      setEducationList(synchronizedEducation);
    }
  }, [synchronizedEducation]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<EducationFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...emptyFormData,
      displayOrder: educationList.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Education) => {
    setEditingId(item.id);
    const inst = item.institution || '';
    setFormData({
      institution: inst.includes('YOUR_') && inst.includes('_HERE') ? '' : inst,
      degree: item.degree || '',
      field: item.field || '',
      startYear: String(item.startYear || ''),
      endYear: String(item.endYear || ''),
      gpa: item.gpa !== undefined && item.gpa !== null && item.gpa !== 0 ? String(item.gpa) : '',
      description: item.description || '',
      displayOrder: item.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.institution.trim() || !formData.degree.trim()) {
      toast.error('Institution and Degree are required.');
      return;
    }

    const payload = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field: formData.field.trim(),
      startYear: formData.startYear.trim(),
      endYear: formData.endYear.trim() || undefined,
      gpa: formData.gpa.trim() || undefined,
      description: formData.description.trim() || undefined,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      let updatedList: Education[];
      if (editingId) {
        updatedList = educationList.map((e) =>
          e.id === editingId ? ({ ...e, ...payload } as Education) : e
        );
      } else {
        const newId = `edu-${Date.now()}`;
        const newEntry: Education = {
          id: newId,
          ...payload,
        } as Education;
        updatedList = [...educationList, newEntry];
      }

      setEducationList(updatedList);

      // Centralized persistence: writes to disk, localStorage, and broadcasts
      const updatedContent = {
        ...content,
        education: updatedList,
      };

      const result = await savePortfolioContent(updatedContent);

      if (result.success) {
        toast.success(
          editingId
            ? 'Education record updated and synchronized immediately across your portfolio!'
            : 'Education record added and synchronized immediately across your portfolio!'
        );
      } else {
        toast.error(`Disk sync notice: ${result.error || 'Saved in local session'}`);
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save education record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const updatedList = educationList.filter((e) => e.id !== deleteTarget.id);
      setEducationList(updatedList);

      const updatedContent = {
        ...content,
        education: updatedList,
      };

      const result = await savePortfolioContent(updatedContent);
      if (result.success) {
        toast.success('Education record deleted and synchronized across portfolio.');
      } else {
        toast.error(`Notice: ${result.error || 'Deleted in local session'}`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete record');
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
            Education History
          </h1>
          <p className="text-sm text-muted mt-1">
            Maintain your academic credentials, degrees, and coursework history.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Education
        </Button>
      </div>

      {/* List */}
      {educationList.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8 text-violet-400" />}
          title="No education entries"
          description="Add your university degree, high school, or academic program."
          action={{
            label: 'Add Education',
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="space-y-4">
          {educationList.map((item) => (
            <Card
              key={item.id}
              variant="glass"
              padding="md"
              className="border-border/70 hover:border-violet-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {item.degree} {item.field && `in ${item.field}`}
                      </h3>
                      {item.gpa && (
                        <Badge variant="accent" size="sm">
                          GPA: {item.gpa}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-muted" />
                      <span>{item.institution}</span>
                      {item.institution?.includes('YOUR_') && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Placeholder needs update
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      <span>
                        {item.startYear} – {item.endYear || 'Present'}
                      </span>
                    </p>

                    {item.description && (
                      <p className="text-xs text-muted/90 pt-2 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    )}
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
        title={editingId ? 'Edit Education' : 'Add Education Record'}
        description="Fill in your academic degree and institution information."
        isLoading={isSubmitting}
        size="md"
      >
        <Input
          label="Institution / University Name"
          value={formData.institution}
          onChange={(e) =>
            setFormData({ ...formData, institution: e.target.value })
          }
          placeholder="e.g. SRM Institute of Science and Technology"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Degree"
            value={formData.degree}
            onChange={(e) =>
              setFormData({ ...formData, degree: e.target.value })
            }
            placeholder="e.g. B.Tech, High School Diploma"
            required
          />

          <Input
            label="Field of Study / Major"
            value={formData.field}
            onChange={(e) =>
              setFormData({ ...formData, field: e.target.value })
            }
            placeholder="e.g. Computer Science Engineering"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Start Year"
            value={formData.startYear}
            onChange={(e) =>
              setFormData({ ...formData, startYear: e.target.value })
            }
            placeholder="2023"
            required
          />

          <Input
            label="End Year"
            value={formData.endYear}
            onChange={(e) =>
              setFormData({ ...formData, endYear: e.target.value })
            }
            placeholder="2027 (or Present)"
          />

          <Input
            label="GPA / Grade"
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            placeholder="e.g. 8.5 / 10"
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
          placeholder="Relevant coursework, academic activities, achievements..."
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
              Delete Record
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete education record?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove the record for{' '}
            <strong className="text-foreground">
              {deleteTarget?.degree} at {deleteTarget?.institution}
            </strong>
            .
          </p>
        </div>
      </Modal>
    </div>
  );
}
