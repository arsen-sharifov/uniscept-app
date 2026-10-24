'use client';

import { Check, X } from 'lucide-react';

import type { IComment, IRichTextDocument, IRichTextValue } from '@interfaces';

import { RichText } from '@/components/RichText';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useTranslations } from '@/i18n';
import { MAX_COMMENT_LENGTH } from '@/lib/canvas';

import { CommentAction } from './CommentAction';
import { CommentSubmitButton } from './CommentSubmitButton';

interface ICommentEditorProps {
  comment: IComment;
  draft?: IRichTextDocument;
  onDraftChange: (document: IRichTextDocument) => void;
  onSave: (value: IRichTextValue) => void;
  onCancel: () => void;
}

export const CommentEditor = ({ comment, draft, onDraftChange, onSave, onCancel }: ICommentEditorProps) => {
  const t = useTranslations();

  return (
    <div className="flex items-end gap-1.5">
      <RichTextEditor
        text={comment.text}
        document={draft ?? comment.richText}
        ariaLabel={t.platform.canvas.comments.editorAriaLabel}
        maxLength={MAX_COMMENT_LENGTH}
        autoFocus
        className="max-h-28 min-w-0 overflow-y-auto font-grotesk break-words text-[color:var(--text-strong)] caret-[color:var(--accent)]"
        onChange={onDraftChange}
        onSubmit={onSave}
        onCancel={onCancel}
        renderSubmit={({ disabled, submit }) => (
          <div className="flex shrink-0 items-center gap-0.5">
            <CommentAction icon={X} label={t.platform.canvas.comments.cancelEdit} onClick={onCancel} />
            <CommentSubmitButton
              icon={Check}
              label={t.platform.canvas.comments.saveEdit}
              disabled={disabled}
              onClick={submit}
            />
          </div>
        )}
        fallback={
          <>
            <RichText
              text={comment.text}
              document={draft ?? comment.richText}
              className="max-h-28 w-full min-w-0 overflow-y-auto font-grotesk break-words whitespace-pre-wrap text-[color:var(--text-strong)]"
            />
            <div className="flex shrink-0 items-center gap-0.5">
              <CommentAction icon={X} label={t.platform.canvas.comments.cancelEdit} onClick={onCancel} />
              <CommentSubmitButton icon={Check} label={t.platform.canvas.comments.saveEdit} disabled />
            </div>
          </>
        }
      />
    </div>
  );
};
