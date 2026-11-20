'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Cpu,
  Layers,
  LayoutGrid,
  AlertTriangle,
  Code,
  Database,
  BarChart,
  Globe,
  Palette,
  TrendingUp,
  Table,
  PieChart,
  Calculator,
  LineChart,
  GitBranch,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { skillsData } from '@/data/profile';
import type { Skill } from '@/types';
import {
  getAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { FormModal } from '@/components/admin/FormModal';
import { Badge } from '@/components/ui/Badge';
import { savePortfolioContent } from '@/hooks/usePortfolioContent';
import { withBasePath } from '@/lib/utils';

const SKILL_CATEGORIES = [
  'Programming & Database',
  'Data Analytics',
  'Data Visualization & Business Intelligence',
  'Machine Learning & Artificial Intelligence',
  'Tools & Technologies',
];

const ICON_OPTIONS = [
  'code',
  'database',
  'bar-chart',
  'globe',
  'palette',
  'trending-up',
  'table',
  'pie-chart',
  'calculator',
  'line-chart',
  'git-branch',
  'braces',
  'brain',
  'workflow',
  'terminal',
];

interface SkillFormData {
  name: string;
  category: string;
  hasProficiency: boolean;
  proficiency: number;
  icon: string;
  displayOrder: number;
}

const emptyFormData: SkillFormData = {
  name: '',
  category: 'Programming & Database',
  hasProficiency: false,
  proficiency: 80,
  icon: 'code',
  displayOrder: 1,
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(skillsData as unknown as Skill[]);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<SkillFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(withBasePath('/api/content'), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.skills && Array.isArray(data.skills) && data.skills.length > 0) {
            setSkills(data.skills);
            return;
          }
        }
        const adminRes = await getAdminSkills();
        if (adminRes?.data && Array.isArray(adminRes.data) && adminRes.data.length > 0) {
          setSkills(adminRes.data);
        }
      } catch {
        // Fallback to local skillsData
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
      displayOrder: skills.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingId(skill.id);
    const hasProf = typeof skill.proficiency === 'number' && skill.proficiency > 0;
    setFormData({
      name: skill.name,
      category: skill.category,
      hasProficiency: hasProf,
      proficiency: hasProf ? skill.proficiency! : 80,
      icon: skill.icon || 'code',
      displayOrder: skill.displayOrder || 1,
    });
    setIsFormOpen(true);
  };

  const handleSaveSkill = async () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error('Skill name is required.');
      return;
    }

    const isDuplicate = skills.some(
      (s) =>
        s.id !== editingId &&
        s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error(`A skill named "${trimmedName}" already exists. Duplicate skills are not allowed.`);
      return;
    }

    const payload: Omit<Skill, 'id'> = {
      name: trimmedName,
      category: formData.category,
      icon: formData.icon,
      displayOrder: Number(formData.displayOrder) || 1,
      proficiency: formData.hasProficiency ? (Number(formData.proficiency) || 80) : undefined,
    };

    setIsSubmitting(true);

    try {
      let updatedSkills: Skill[];

      if (editingId) {
        try {
          await updateSkill(editingId, payload);
        } catch {
          // offline mode
        }

        updatedSkills = skills.map((s) =>
          s.id === editingId ? ({ ...s, ...payload } as Skill) : s
        );
        setSkills(updatedSkills);
        toast.success(`Skill "${payload.name}" updated!`);
      } else {
        const newId = `skill-${Date.now()}`;
        const newSkill: Skill = {
          id: newId,
          ...payload,
        } as Skill;

        try {
          await createSkill(payload);
        } catch {
          // offline mode
        }

        updatedSkills = [...skills, newSkill];
        setSkills(updatedSkills);
        toast.success(`Skill "${payload.name}" added!`);
      }

      // Synchronize with centralized portfolioContent.json and broadcast across portfolio
      try {
        const res = await fetch(withBasePath('/api/content'), { cache: 'no-store' });
        if (res.ok) {
          const fullContent = await res.json();
          fullContent.skills = updatedSkills;
          await savePortfolioContent(fullContent);
        }
      } catch {
        // Broadcast
      }

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      try {
        await deleteSkill(deleteTarget.id);
      } catch {
        // offline mode
      }

      const updatedSkills = skills.filter((s) => s.id !== deleteTarget.id);
      setSkills(updatedSkills);
      toast.success(`Skill "${deleteTarget.name}" deleted.`);

      // Synchronize with central portfolioContent.json and broadcast across portfolio
      try {
        const res = await fetch(withBasePath('/api/content'), { cache: 'no-store' });
        if (res.ok) {
          const fullContent = await res.json();
          fullContent.skills = updatedSkills;
          await savePortfolioContent(fullContent);
        }
      } catch {
        // Broadcast
      }

      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete skill');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSkills = useMemo(() => {
    if (filterCategory === 'all') return skills;
    return skills.filter((s) => s.category === filterCategory);
  }, [skills, filterCategory]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(skills.map((s) => s.category)));
    return list.sort();
  }, [skills]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Skills & Competencies
          </h1>
          <p className="text-sm text-muted mt-1">
            Configure technical proficiencies, tools, and categories displayed on your profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupByCategory(!groupByCategory)}
            leftIcon={groupByCategory ? <LayoutGrid className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          >
            {groupByCategory ? 'Flat View' : 'Group by Category'}
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-surface-elevated text-muted hover:text-foreground'
          }`}
        >
          All Categories ({skills.length})
        </button>
        {categories.map((cat) => {
          const count = skills.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-surface-elevated text-muted hover:text-foreground'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {groupByCategory && filterCategory === 'all' ? (
        // Grouped View
        <div className="space-y-8">
          {categories.map((cat) => {
            const groupSkills = skills
              .filter((s) => s.category === cat)
              .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-base font-semibold text-foreground font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{cat}</span>
                    <span className="text-xs text-muted font-normal font-mono">
                      ({groupSkills.length})
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onEdit={() => handleOpenEdit(skill)}
                      onDelete={() => setDeleteTarget(skill)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onEdit={() => handleOpenEdit(skill)}
              onDelete={() => setDeleteTarget(skill)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveSkill}
        title={editingId ? 'Edit Skill' : 'Add New Skill'}
        description="Configure proficiency score and visual presentation."
        isLoading={isSubmitting}
        size="md"
      >
        <Input
          label="Skill Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Python, SQL, React"
          required
        />

        <div className="grid grid-cols-2 gap-4">
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
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1.5">
              Icon Keyword
            </label>
            <select
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full bg-surface-elevated/70 text-foreground border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-mono"
            >
              {ICON_OPTIONS.map((ico) => (
                <option key={ico} value={ico}>
                  {ico}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Proficiency Toggle */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="adminSkillHasProficiency"
            checked={!!formData.hasProficiency}
            onChange={(e) =>
              setFormData({
                ...formData,
                hasProficiency: e.target.checked,
                proficiency: e.target.checked ? (formData.proficiency || 80) : 80,
              })
            }
            className="w-4 h-4 rounded text-violet-600 bg-surface border-border focus:ring-violet-500 cursor-pointer"
          />
          <label htmlFor="adminSkillHasProficiency" className="text-xs text-foreground cursor-pointer select-none">
            Display numeric proficiency percentage (e.g. 85%)
          </label>
        </div>

        {formData.hasProficiency && (
          <div className="space-y-2 p-4 rounded-xl bg-surface-elevated/40 border border-border/60">
            <div className="flex items-center justify-between text-sm">
              <label className="font-medium text-foreground">Proficiency</label>
              <span className="font-mono text-sm font-bold text-violet-400">
                {formData.proficiency}%
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={100}
              value={formData.proficiency}
              onChange={(e) =>
                setFormData({ ...formData, proficiency: parseInt(e.target.value) || 0 })
              }
              className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-violet-500"
            />

            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>Beginner (0%)</span>
              <span>Intermediate (50%)</span>
              <span>Advanced (90%+)</span>
            </div>
          </div>
        )}

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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Skill Deletion"
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
              Delete Skill
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              Delete skill &ldquo;{deleteTarget?.name}&rdquo;?
            </p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This skill will no longer appear on your technical skills grid or proficiency charts.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasProf = typeof skill.proficiency === 'number' && skill.proficiency > 0;

  return (
    <Card
      variant="glass"
      padding="sm"
      className="border border-border/70 hover:border-violet-500/30 transition-all flex flex-col justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{skill.name}</p>
              <p className="text-[11px] text-muted font-mono truncate">{skill.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg text-muted hover:text-violet-400 hover:bg-surface-elevated transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-elevated transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Proficiency Bar rendered ONLY if proficiency is provided */}
        {hasProf ? (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted">Proficiency</span>
              <span className="font-mono text-xs font-bold text-cyan-400">
                {skill.proficiency}%
              </span>
            </div>
            <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
              <div
                style={{ width: `${skill.proficiency}%` }}
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
              />
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <span className="text-[10px] font-mono text-violet-300/80 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              Competency (No % level)
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
