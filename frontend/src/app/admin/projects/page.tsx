'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  Star,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsData } from '@/data/profile';
import type { Project } from '@/types';
import { slugify } from '@/lib/utils';
import { getAutoProjectImage } from '@/lib/projectImages';
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/admin-api';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FormModal } from '@/components/admin/FormModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const CATEGORIES = [
  'Web Development',
  'Data Analysis',
  'AI/ML',
  'Automation',
  'Python Development',
  'Database Management',
  'Other',
];

interface ProjectFormData {
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  featured: boolean;
  displayOrder: number;
}

const emptyFormData: ProjectFormData = {
  title: '',
  slug: '',
  category: 'Web Development',
  description: '',
  longDescription: '',
  technologies: '',
  githubUrl: '',
  liveUrl: '',
  imageUrl: getAutoProjectImage({ category: 'Web Development' }),
  featured: false,
  displayOrder: 1,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(projectsData as unknown as Project[]);
  const [isLoading, setIsLoading] = useState(false);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Attempt to load from API if backend is online
  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminProjects();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
        }
      } catch {
        // Fallback to initial local state
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
      displayOrder: projects.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category || 'Web Development',
      description: project.description,
      longDescription: project.longDescription || '',
      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(', ')
        : '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      imageUrl: project.imageUrl || '',
      featured: Boolean(project.featured),
      displayOrder: project.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const shouldAutoSlug = !editingId || prev.slug === slugify(prev.title);
      return {
        ...prev,
        title: val,
        slug: shouldAutoSlug ? slugify(val) : prev.slug,
      };
    });
  };

  const handleSaveProject = async () => {
    if (!formData.title.trim()) {
      toast.error('Project title is required.');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Project slug is required.');
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const assignedImageUrl =
      formData.imageUrl.trim() || getAutoProjectImage(formData);

    const projectPayload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      description: formData.description.trim(),
      longDescription: formData.longDescription.trim(),
      technologies: techArray,
      githubUrl: formData.githubUrl.trim(),
      liveUrl: formData.liveUrl.trim(),
      imageUrl: assignedImageUrl,
      featured: formData.featured,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Try API
        try {
          await updateProject(editingId, projectPayload);
        } catch {
          // offline mode
        }

        // Update local React state
        setProjects((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...projectPayload,
                }
              : item
          )
        );
        toast.success('Project updated successfully!');
      } else {
        const newId = `proj-${Date.now()}`;
        const newProject: Project = {
          id: newId,
          ...projectPayload,
          createdAt: new Date().toISOString(),
        };

        // Try API
        try {
          await createProject(projectPayload);
        } catch {
          // offline mode
        }

        setProjects((prev) => [newProject, ...prev]);
        toast.success('New project created!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteProject(deleteTarget.id);
      } catch {
        // offline mode
      }

      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Project "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (project) => (
        <div className="space-y-1 max-w-xs">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <span>{project.title}</span>
            {project.featured && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted line-clamp-1">{project.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (project) => (
        <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-xs font-mono border border-border">
          {project.category}
        </span>
      ),
    },
    {
      key: 'technologies',
      header: 'Technologies',
      render: (project) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {project.technologies?.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[11px] rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
            >
              {tech}
            </span>
          ))}
          {project.technologies?.length > 3 && (
            <span className="text-[10px] text-muted self-center">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      align: 'center',
      sortable: true,
      render: (project) =>
        project.featured ? (
          <Badge variant="primary" size="sm">
            Featured
          </Badge>
        ) : (
          <span className="text-xs text-muted">Standard</span>
        ),
    },
    {
      key: 'displayOrder',
      header: 'Order',
      align: 'center',
      sortable: true,
      render: (project) => (
        <span className="font-mono text-xs">{project.displayOrder}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (project) => (
        <div className="flex items-center justify-end gap-1.5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              title="GitHub Repo"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted hover:text-cyan-400 hover:bg-surface-elevated transition-colors"
              title="Live URL"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => handleOpenEdit(project)}
            className="p-1.5 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
            title="Edit Project"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(project)}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Project Showcase
          </h1>
          <p className="text-sm text-muted mt-1">
            Create, update, and prioritize projects displayed on your portfolio.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add New Project
        </Button>
      </div>

      {/* Projects DataTable */}
      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        searchPlaceholder="Search projects by title, category, or tech..."
        searchKeys={['title', 'category', 'description']}
        emptyTitle="No projects registered"
        emptyDescription="Get started by clicking 'Add New Project' above."
        emptyAction={{
          label: 'Add Project',
          onClick: handleOpenAdd,
        }}
      />

      {/* Add / Edit Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveProject}
        title={editingId ? 'Edit Project' : 'Create New Project'}
        description="Provide comprehensive details about this showcase project."
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Studexa Student Database"
            required
          />

          <Input
            label="Slug (URL identifier)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. studexa"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) =>
              setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
            }
            min={1}
          />
        </div>

        <Input
          label="Short Summary"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="One or two sentences highlighting the core purpose..."
          required
        />

        <Input
          label="Long Description (Markdown enabled)"
          inputType="textarea"
          rows={6}
          value={formData.longDescription}
          onChange={(e) =>
            setFormData({ ...formData, longDescription: e.target.value })
          }
          placeholder="### Overview&#10;Detailed architecture, problem statement, key achievements..."
        />

        <Input
          label="Technologies (comma-separated)"
          value={formData.technologies}
          onChange={(e) =>
            setFormData({ ...formData, technologies: e.target.value })
          }
          placeholder="Python, SQL, PostgreSQL, Pandas"
          helperText="Separate multiple tags with a comma"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="GitHub Repository URL"
            value={formData.githubUrl}
            onChange={(e) =>
              setFormData({ ...formData, githubUrl: e.target.value })
            }
            placeholder="https://github.com/Mukeshpramanik/..."
          />

          <Input
            label="Live Demo URL"
            value={formData.liveUrl}
            onChange={(e) =>
              setFormData({ ...formData, liveUrl: e.target.value })
            }
            placeholder="https://..."
          />
        </div>

        <Input
          label="Preview Image URL"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://.../preview.png or /projects/studexa.png"
        />

        {/* Featured Toggle */}
        <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/40 border border-border cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) =>
              setFormData({ ...formData, featured: e.target.checked })
            }
            className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-surface border-border"
          />
          <div className="text-sm">
            <span className="font-medium text-foreground block">
              Mark as Featured Project
            </span>
            <span className="text-xs text-muted block">
              Featured projects are given prominent placement on the home page hero
              showcase.
            </span>
          </div>
        </label>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Project Deletion"
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
              onClick={handleDeleteConfirm}
            >
              Delete Project
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Are you sure you want to delete this project?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove{' '}
            <strong className="text-foreground">
              {deleteTarget?.title}
            </strong>{' '}
            from your public portfolio. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
