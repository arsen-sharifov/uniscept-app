'use client';

import { useId } from 'react';

import { Modal } from './Modal';

export interface IConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: IConfirmDialogProps) => {
  const messageId = useId();

  return (
    <Modal open={open} onClose={onCancel} width="max-w-sm">
      <div role="alertdialog" aria-describedby={messageId} className="p-6">
        <h3 className="text-base font-semibold text-[color:var(--text-strong)]">{title}</h3>
        <p id={messageId} className="mt-2 text-sm text-[color:var(--text-muted)]">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="cursor-pointer rounded-xl px-4 py-1.5 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-[color:var(--status-error)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--status-error-border)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
