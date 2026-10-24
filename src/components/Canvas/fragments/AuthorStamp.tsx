'use client';

import { clsx } from 'clsx';
import { UserRound } from 'lucide-react';

import { AVATAR_ICON_BY_ID } from '@constants';
import { SmartTooltip } from '@/components/Tooltip';
import { useTranslations } from '@/i18n';

import { useCanvasAuthor, useTimestampLabel } from '../hooks';
import { toShortName } from '../utils';

interface IAuthorStampProps {
  placement: 'node' | 'comment';
  authorId?: string;
  createdAt?: string;
  editedAt?: string;
  editedBy?: string;
  className?: string;
}

export const AuthorStamp = ({ placement, authorId, createdAt, editedAt, editedBy, className }: IAuthorStampProps) => {
  const t = useTranslations();
  const author = useCanvasAuthor(authorId);
  const editor = useCanvasAuthor(editedBy ?? authorId);
  const created = useTimestampLabel(createdAt);
  const edited = useTimestampLabel(editedAt);

  const isMember = author.kind === 'member';
  const isInNode = placement === 'node';
  const AvatarIcon = author.avatarIcon ? AVATAR_ICON_BY_ID[author.avatarIcon] : null;
  const shownName = isMember ? toShortName(author.name) : author.name;
  const isShortened = shownName !== author.name;
  const shown = edited ?? created;
  const createdDetail = created ? t('platform.canvas.authorship.createdDetail', { time: created.exact }) : null;
  const editedDetail = edited
    ? t('platform.canvas.authorship.editedDetail', { name: editor.name, time: edited.exact })
    : null;

  return (
    <div
      data-export-omit
      className={clsx(
        'flex min-w-0 items-center gap-2 font-grotesk text-[11.5px] leading-4 select-none',
        isInNode && 'rounded-b-[11px] bg-[color:var(--accent-soft)]/60 py-1.5',
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isMember && (
          <span
            aria-hidden
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] font-mono-ui text-[10px] leading-none font-bold text-[color:var(--accent-text)]"
          >
            {AvatarIcon ? <AvatarIcon size={10} strokeWidth={2.25} /> : [...author.name][0]?.toUpperCase()}
          </span>
        )}
        {!isMember && (
          <span
            aria-hidden
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed border-[color:var(--border-strong)] text-[color:var(--text-label)]"
          >
            <UserRound className="h-2.5 w-2.5" strokeWidth={2} />
          </span>
        )}

        <SmartTooltip
          content={author.name}
          onlyIfTruncated={!isShortened}
          className={clsx(
            'min-w-0 truncate',
            isMember && isInNode && 'font-medium text-[color:var(--text-muted)]',
            isMember && !isInNode && 'text-[12px] font-semibold text-[color:var(--text-strong)]',
            !isMember && 'text-[color:var(--text-label)]',
          )}
        >
          {isShortened ? (
            <>
              <span aria-hidden>{shownName}</span>
              <span className="sr-only">{author.name}</span>
            </>
          ) : (
            author.name
          )}
        </SmartTooltip>
      </span>

      {shown && (
        <span className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-[color:var(--text-muted)] tabular-nums">
          <SmartTooltip
            content={
              <span className="flex flex-col">
                {createdDetail && <span>{createdDetail}</span>}
                {editedDetail && <span>{editedDetail}</span>}
              </span>
            }
          >
            <time
              dateTime={shown.dateTime}
              tabIndex={isInNode ? undefined : 0}
              className="rounded-sm focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none"
            >
              <span aria-hidden>{shown.label}</span>
              <span className="sr-only">{[createdDetail, editedDetail].filter(Boolean).join('. ')}</span>
            </time>
          </SmartTooltip>
          {edited && (
            <>
              <span aria-hidden className="text-[color:var(--text-subtle)]">
                ·
              </span>
              <span aria-hidden>{t.platform.canvas.authorship.edited}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
};
