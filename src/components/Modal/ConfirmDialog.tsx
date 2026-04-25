'use client';

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
}: IConfirmDialogProps) => (
  <Modal open={open} onClose={onCancel} className="max-w-sm">
    <div className="p-6">
      <h3 className="text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm text-black/50">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-xl px-4 py-1.5 text-sm font-medium text-black/50 transition-colors hover:bg-black/5 hover:text-black"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="cursor-pointer rounded-xl bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);
