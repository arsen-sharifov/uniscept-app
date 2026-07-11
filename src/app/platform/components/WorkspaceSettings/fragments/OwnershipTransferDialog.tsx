'use client';

import { Crown } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import type { IWorkspaceMember } from '@interfaces';
import { useFocusTrap } from '@hooks';
import { useTranslations } from '@/i18n';

export interface IOwnershipTransferDialogProps {
  member: IWorkspaceMember;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OwnershipTransferDialog = ({ member, onConfirm, onCancel }: IOwnershipTransferDialogProps) => {
  const t = useTranslations();
  const { members } = t.platform.workspaceSettings;
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  useFocusTrap(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    panelRef.current?.focus();

    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onCancel]);

  const displayName = member.name || member.email;

  return createPortal(
    <div
      onClick={(clickEvent) => {
        if (clickEvent.target === clickEvent.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-[color:var(--surface)] p-6 text-[color:var(--text)] shadow-[var(--shadow-modal)] outline-none"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--status-error-soft)] text-[color:var(--status-error)]">
            <Crown className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold tracking-[0.16em] text-[color:var(--status-error)] uppercase">
              {members.transferCritical}
            </p>
            <h3 id={titleId} className="text-base font-semibold text-[color:var(--text-strong)]">
              {members.transferTitle}
            </h3>
          </div>
        </div>
        <p id={descId} className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
          {members.transferConfirmPrefix} &ldquo;{displayName}&rdquo;{members.transferConfirmSuffix}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            {members.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-[color:var(--status-error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[color:var(--status-error-border)]"
          >
            {members.transferConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
