'use client';

import { clsx } from 'clsx';
import { Pencil, Trash2 } from 'lucide-react';

import type { IComment, IRichTextDocument, IRichTextValue } from '@interfaces';
import { useReturnFocus } from '@hooks';
import { RichText } from '@/components/RichText';
import { useTranslations } from '@/i18n';

import { AuthorStamp } from './AuthorStamp';
import { CommentAction } from './CommentAction';
import { CommentEditor } from './CommentEditor';

interface ICommentItemProps {
  comment: IComment;
  canManage: boolean;
  isEditing: boolean;
  draft?: IRichTextDocument;
  onEdit: () => void;
  onDraftChange: (document: IRichTextDocument) => void;
  onCancelEdit: () => void;
  onSave: (value: IRichTextValue) => void;
  onDelete: () => void;
}

export const CommentItem = ({
  comment,
  canManage,
  isEditing,
  draft,
  onEdit,
  onDraftChange,
  onCancelEdit,
  onSave,
  onDelete,
}: ICommentItemProps) => {
  const t = useTranslations();

  useReturnFocus(isEditing);

  return (
    <article
      className={clsx(
        'group/comment relative flex flex-col gap-1.5 rounded-lg bg-[color:var(--surface-elevated)] px-3 py-2.5 text-[12.5px] leading-[18px] text-[color:var(--text)] ring-1 transition-shadow duration-150 ring-inset motion-reduce:transition-none',
        isEditing ? 'ring-[color:var(--border-active)]' : 'ring-[color:var(--border)]',
        canManage &&
          !isEditing &&
          'hover:ring-[color:var(--border-strong)] has-focus-visible:ring-[color:var(--border-strong)]',
      )}
    >
      <AuthorStamp
        placement="comment"
        authorId={comment.authorId}
        createdAt={comment.createdAt}
        editedAt={comment.editedAt}
      />

      {canManage && (
        <div
          className={clsx(
            'absolute -top-2.5 right-2 z-10 flex items-center rounded-md bg-[color:var(--surface-elevated)] shadow-[var(--shadow-pip)] ring-1 ring-[color:var(--border)] transition-opacity duration-150 motion-reduce:transition-none',
            isEditing ? 'invisible' : 'opacity-0 group-hover/comment:opacity-100 has-focus-visible:opacity-100',
          )}
        >
          <CommentAction icon={Pencil} label={t.platform.canvas.comments.editAriaLabel} onClick={onEdit} />
          <CommentAction icon={Trash2} label={t.platform.canvas.comments.deleteAriaLabel} onClick={onDelete} danger />
        </div>
      )}

      {isEditing ? (
        <CommentEditor
          comment={comment}
          draft={draft}
          onDraftChange={onDraftChange}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
        <RichText
          text={comment.text}
          document={comment.richText}
          className="min-w-0 font-grotesk break-words whitespace-pre-wrap"
        />
      )}
    </article>
  );
};
