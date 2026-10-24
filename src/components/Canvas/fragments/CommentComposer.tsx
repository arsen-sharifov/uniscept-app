'use client';

import { clsx } from 'clsx';
import { Send } from 'lucide-react';

import type { IRichTextDocument } from '@interfaces';

import { RichText } from '@/components/RichText';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useTranslations } from '@/i18n';
import { MAX_COMMENT_LENGTH } from '@/lib/canvas';
import { isBlankRichText } from '@/lib/richText';
import { useCanvasStore } from '@/lib/stores';

import { CommentSubmitButton } from './CommentSubmitButton';

interface ICommentComposerProps {
  nodeId: string;
  draft: IRichTextDocument | null;
  onDraftChange: (draft: IRichTextDocument | null) => void;
}

export const CommentComposer = ({ nodeId, draft, onDraftChange }: ICommentComposerProps) => {
  const t = useTranslations();
  const addComment = useCanvasStore((state) => state.addComment);

  return (
    <div className="nopan nowheel flex items-end gap-2 border-t border-[color:var(--border)] px-2.5 py-1.5">
      <RichTextEditor
        text=""
        document={draft ?? undefined}
        ariaLabel={t.platform.canvas.node.addCommentPlaceholder}
        placeholder={t.platform.canvas.node.addCommentPlaceholder}
        maxLength={MAX_COMMENT_LENGTH}
        className="max-h-28 overflow-y-auto px-1 py-0.5 text-[12px] leading-snug text-[color:var(--text-strong)] caret-[color:var(--accent)]"
        clearOnSubmit
        onChange={(document) => onDraftChange(isBlankRichText(document) ? null : document)}
        onSubmit={({ text, document }) => addComment(nodeId, text, document)}
        renderSubmit={({ disabled, submit }) => (
          <CommentSubmitButton
            icon={Send}
            label={t.platform.canvas.node.sendComment}
            disabled={disabled}
            onClick={submit}
          />
        )}
        fallback={
          <>
            <RichText
              text={t.platform.canvas.node.addCommentPlaceholder}
              document={draft ?? undefined}
              className={clsx(
                'max-h-28 w-full min-w-0 overflow-y-auto px-1 py-0.5 text-[12px] leading-snug whitespace-pre-wrap',
                draft ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]',
              )}
            />
            <CommentSubmitButton icon={Send} label={t.platform.canvas.node.sendComment} disabled />
          </>
        }
      />
    </div>
  );
};
