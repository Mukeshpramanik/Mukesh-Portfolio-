'use client';

import React from 'react';
import { Modal, type ModalSize } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  size?: ModalSize;
  className?: string;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  isLoading = false,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  size = 'md',
  className,
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      className={className}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            {saveLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
}

export default FormModal;
