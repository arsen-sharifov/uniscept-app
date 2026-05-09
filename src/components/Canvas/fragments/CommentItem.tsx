'use client';

import { Trash2 } from 'lucide-react';
import type { IComment } from '@interfaces';
import { useTranslations } from '@hooks';

interface ICommentItemProps {
  comment: IComment;
  canDelete: boolean;
  onDelete: (commentId: string) => void;
}

export const CommentItem = ({ comment, canDelete, onDelete }: ICommentItemProps) => {
  const t = useTranslations();

  return (
    <div className="group/comment flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-[11.5px] leading-snug text-neutral-700 ring-1 ring-black/[0.04] ring-inset">
      <span className="flex-1 break-words">{comment.text}</span>

      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          className="-mt-0.5 -mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-neutral-300 opacity-0 transition-[opacity,background,color] duration-150 group-hover/comment:opacity-100 hover:bg-red-500/10 hover:text-red-500"
          aria-label={t.platform.canvas.comments.deleteAriaLabel}
          title={t.platform.canvas.comments.deleteTitle}
        >
          <Trash2 className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  );
};
