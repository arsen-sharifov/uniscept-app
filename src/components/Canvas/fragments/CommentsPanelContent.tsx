'use client';

import { MessageSquare, X } from 'lucide-react';

import type { IComment, ICommentEditDraft, IRichTextDocument, IRichTextValue } from '@interfaces';

import { useTranslations } from '@/i18n';
import { isSameRichTextValue } from '@/lib/richText';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';

interface ICommentsPanelContentProps {
  nodeId: string;
  comments: IComment[];
  draft: IRichTextDocument | null;
  onDraftChange: (draft: IRichTextDocument | null) => void;
  edit: ICommentEditDraft | null;
  onEditChange: (edit: ICommentEditDraft | null) => void;
}

export const CommentsPanelContent = ({
  nodeId,
  comments,
  draft,
  onDraftChange,
  edit,
  onEditChange,
}: ICommentsPanelContentProps) => {
  const t = useTranslations();

  const setOpenCommentsNodeId = useCanvasStore((state) => state.setOpenCommentsNodeId);
  const updateComment = useCanvasStore((state) => state.updateComment);
  const deleteComment = useCanvasStore((state) => state.deleteComment);
  const userId = usePermissionsStore((state) => state.userId);
  const canComment = usePermissionsStore((state) => state.canComment);

  const editingId = edit && comments.some((comment) => comment.id === edit.commentId) ? edit.commentId : null;

  const saveComment = (comment: IComment, value: IRichTextValue) => {
    onEditChange(null);
    if (!value.text || isSameRichTextValue(value, comment.text, comment.richText)) return;

    updateComment(nodeId, comment.id, value.text, value.document);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
          <MessageSquare className="h-3 w-3" strokeWidth={2.5} />
          {t.platform.canvas.node.commentsHeader}
          {comments.length > 0 && (
            <span className="rounded-full bg-[color:var(--surface-overlay)] px-1.5 py-px text-[9px] tracking-[0.08em] text-[color:var(--text-muted)] tabular-nums">
              {comments.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpenCommentsNodeId(null)}
          className="flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none"
          aria-label={t.platform.canvas.node.closeComments}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="nowheel nopan flex max-h-56 flex-col gap-1.5 overflow-y-auto bg-[color:var(--surface-soft)] p-2.5">
        {comments.length === 0 ? (
          <p className="mx-auto max-w-[200px] py-4 text-center text-[11px] leading-snug text-[color:var(--text-muted)]">
            {t.platform.canvas.node.noComments}
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canManage={canComment && comment.authorId === userId && (editingId === null || editingId === comment.id)}
              isEditing={editingId === comment.id}
              draft={editingId === comment.id ? edit?.document : undefined}
              onEdit={() => onEditChange({ commentId: comment.id })}
              onDraftChange={(document) => onEditChange({ commentId: comment.id, document })}
              onCancelEdit={() => onEditChange(null)}
              onSave={(value) => saveComment(comment, value)}
              onDelete={() => deleteComment(nodeId, comment.id)}
            />
          ))
        )}
      </div>

      {canComment && <CommentComposer nodeId={nodeId} draft={draft} onDraftChange={onDraftChange} />}
    </>
  );
};
