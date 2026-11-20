'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  Building,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { certificationsData } from '@/data/profile';
import type { Certification } from '@/types';
import {
  getAdminCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { EmptyState } from '@/components/ui/EmptyState';

interface CertFormData {
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  imageUrl: string;
  displayOrder: number;
}

const emptyFormData: CertFormData = {
  title: '',
  issuer: '',
  date: '',
  credentialUrl: '',
  imageUrl: '',
  displayOrder: 1,
};

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>(
    certificationsData as unknown as Certification[]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<CertFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminCertifications();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setCertifications(res.data);
        }
      } catch {
        // Fallback to local certificationsData
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
      displayOrder: certifications.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      credentialUrl: cert.credentialUrl || '',
      imageUrl: cert.imageUrl || '',
      displayOrder: cert.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.issuer.trim()) {
      toast.error('Certification Title and Issuer are required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      date: formData.date.trim(),
      credentialUrl: formData.credentialUrl.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        try {
          await updateCertification(editingId, payload);
        } catch {
          // offline mode
        }

        setCertifications((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
        );
        toast.success('Certification updated!');
      } else {
        const newId = `cert-${Date.now()}`;
        const newCert: Certification = {
          id: newId,
          ...payload,
        };

        try {
          await createCertification(payload);
        } catch {
          // offline mode
        }

        setCertifications((prev) => [...prev, newCert]);
        toast.success('Certification added!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save certification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteCertification(deleteTarget.id);
      } catch {
        // offline mode
      }

      setCertifications((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );
      toast.success('Certification deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete certification');
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
            Certifications & Badges
          </h1>
          <p className="text-sm text-muted mt-1">
            Display professional certifications, licenses, and verified credentials.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Certification
        </Button>
      </div>

      {/* Grid */}
      {certifications.length === 0 ? (
        <EmptyState
          icon={<Award className="w-8 h-8 text-violet-400" />}
          title="No certifications yet"
          description="Add your certifications in Python, Data Science, AWS, or SQL."
          action={{
            label: 'Add Certification',
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert) => (
            <Card
              key={cert.id}
              variant="glass"
              padding="md"
              className="border-border/70 hover:border-violet-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cert)}
                      className="p-1.5 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cert)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">
                    {cert.issuer}
                  </p>
                </div>

                {cert.date && (
                  <p className="text-xs text-muted font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued {cert.date}</span>
                  </p>
                )}
              </div>

              {cert.credentialUrl && (
                <div className="pt-4 mt-3 border-t border-border/50">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verify Credential</span>
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        title={editingId ? 'Edit Certification' : 'Add Certification'}
        description="Provide certificate title, issuing organization, and verification link."
        isLoading={isSubmitting}
        size="md"
      >
        <Input
          label="Certification Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Python for Everybody, Google Data Analytics"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Issuing Organization"
            value={formData.issuer}
            onChange={(e) =>
              setFormData({ ...formData, issuer: e.target.value })
            }
            placeholder="e.g. Coursera, DeepLearning.AI, IBM"
            required
          />

          <Input
            label="Issue Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="e.g. May 2024"
          />
        </div>

        <Input
          label="Credential / Verification URL"
          value={formData.credentialUrl}
          onChange={(e) =>
            setFormData({ ...formData, credentialUrl: e.target.value })
          }
          placeholder="https://coursera.org/verify/..."
        />

        <Input
          label="Badge Image URL"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://.../badge.png"
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
              Delete Certification
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete certification?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove{' '}
            <strong className="text-foreground">
              {deleteTarget?.title}
            </strong>{' '}
            from your portfolio showcase.
          </p>
        </div>
      </Modal>
    </div>
  );
}
