'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { blogPostsData } from '@/data/profile';
import type { BlogPost } from '@/types';
import { slugify, formatDate } from '@/lib/utils';
import {
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/admin-api';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FormModal } from '@/components/admin/FormModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  published: boolean;
}

const emptyFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  published: true,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(
    blogPostsData as unknown as BlogPost[]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview modal
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminBlogPosts();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setPosts(res.data);
        }
      } catch {
        // Fallback to local blogPostsData
      } finally {
        setIsLoading(false);
      }
    };
    fetchRemote();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      published: Boolean(post.published),
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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error('Title and Slug are required.');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Post content is required.');
      return;
    }

    const tagList = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Approximate read time: ~200 words per minute
    const wordCount = formData.content.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content,
      coverImage: formData.coverImage.trim() || undefined,
      tags: tagList,
      published: formData.published,
      publishedAt: formData.published ? new Date().toISOString() : undefined,
      readTimeMinutes,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        try {
          await updateBlogPost(editingId, payload);
        } catch {
          // offline mode
        }

        setPosts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        );
        toast.success('Blog post updated!');
      } else {
        const newId = `post-${Date.now()}`;
        const newPost: BlogPost = {
          id: newId,
          ...payload,
          createdAt: new Date().toISOString(),
        };

        try {
          await createBlogPost(payload);
        } catch {
          // offline mode
        }

        setPosts((prev) => [newPost, ...prev]);
        toast.success('Blog post created!');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteBlogPost(deleteTarget.id);
      } catch {
        // offline mode
      }

      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Post deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: 'Article Title',
      sortable: true,
      render: (post) => (
        <div className="space-y-1 max-w-sm">
          <p className="font-semibold text-foreground">{post.title}</p>
          <p className="text-xs text-muted line-clamp-1">{post.excerpt}</p>
        </div>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      align: 'center',
      sortable: true,
      render: (post) =>
        post.published ? (
          <Badge variant="success" size="sm" dot>
            Published
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Draft
          </Badge>
        ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (post) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {post.tags?.slice(0, 2).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20"
            >
              {t}
            </span>
          ))}
          {post.tags?.length > 2 && (
            <span className="text-[10px] text-muted self-center">
              +{post.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'readTimeMinutes',
      header: 'Read Time',
      align: 'center',
      sortable: true,
      render: (post) => (
        <span className="text-xs text-muted font-mono flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          {post.readTimeMinutes || 3}m
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (post) => (
        <span className="text-xs text-muted font-mono">
          {formatDate(post.publishedAt || post.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (post) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewPost(post)}
            className="p-1.5 rounded-lg text-muted hover:text-cyan-400 hover:bg-surface-elevated transition-colors"
            title="Preview Article"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(post)}
            className="p-1.5 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
            title="Edit Article"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(post)}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
            title="Delete Article"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Blog & Articles
          </h1>
          <p className="text-sm text-muted mt-1">
            Publish technical tutorials, data analytics insights, and developer essays.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Write New Post
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={posts}
        isLoading={isLoading}
        searchPlaceholder="Search articles by title, excerpt, or tags..."
        searchKeys={['title', 'excerpt']}
        emptyTitle="No articles found"
        emptyDescription="Create your first blog post to share insights with visitors."
        emptyAction={{
          label: 'Write Post',
          onClick: handleOpenAdd,
        }}
      />

      {/* Add / Edit Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        title={editingId ? 'Edit Blog Post' : 'Create Blog Post'}
        description="Write and publish content with markdown support."
        isLoading={isSubmitting}
        size="full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Post Title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Building Scalable ETL Pipelines with Python"
            required
          />

          <Input
            label="Slug (URL identifier)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. building-scalable-etl-pipelines"
            required
          />
        </div>

        <Input
          label="Short Excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief summary displayed on article cards (1-2 sentences)..."
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cover Image URL"
            value={formData.coverImage}
            onChange={(e) =>
              setFormData({ ...formData, coverImage: e.target.value })
            }
            placeholder="https://.../cover.png"
          />

          <Input
            label="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Python, Data Analysis, Tutorials"
          />
        </div>

        <Input
          label="Article Content (Markdown supported)"
          inputType="textarea"
          rows={12}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="## Introduction&#10;&#10;Write your post body here with markdown headings, code blocks, lists..."
          required
        />

        {/* Published Toggle */}
        <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-elevated/40 border border-border cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) =>
              setFormData({ ...formData, published: e.target.checked })
            }
            className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-surface border-border"
          />
          <div className="text-sm">
            <span className="font-medium text-foreground block">
              Publish immediately
            </span>
            <span className="text-xs text-muted block">
              Uncheck to save as a draft visible only in this dashboard.
            </span>
          </div>
        </label>
      </FormModal>

      {/* Preview Modal */}
      <Modal
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        title={previewPost?.title || 'Article Preview'}
        description={
          previewPost
            ? `Status: ${previewPost.published ? 'Published' : 'Draft'} • ${previewPost.readTimeMinutes || 3} min read`
            : undefined
        }
        size="full"
        footer={
          <div className="flex justify-end w-full">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setPreviewPost(null)}
            >
              Close Preview
            </Button>
          </div>
        }
      >
        {previewPost && (
          <div className="prose prose-invert max-w-none space-y-4 text-foreground/90 leading-relaxed text-sm">
            <div className="p-4 rounded-xl bg-surface-elevated/50 border border-border/60 text-xs text-muted italic">
              {previewPost.excerpt}
            </div>

            <div className="pt-2">
              <ReactMarkdown>{previewPost.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </Modal>

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
              Delete Article
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete article &ldquo;{deleteTarget?.title}&rdquo;?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove the article and slug from your blog.
          </p>
        </div>
      </Modal>
    </div>
  );
}
