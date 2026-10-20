'use client';

import { clsx } from 'clsx';

import type { IRichTextDocument } from '@interfaces';

import { RichText } from '@/components/RichText';
import { useTranslations } from '@/i18n';

import { useExpandableLabel } from '../hooks';
import { CommentsButton } from './CommentsButton';
import { ExpandToggle } from './ExpandToggle';
import { NodeLabelEditor } from './NodeLabelEditor';

interface ICanvasNodeLabelProps {
  id: string;
  label: string;
  richLabel?: IRichTextDocument;
  isEditing: boolean;
  measured: boolean;
  commentCount: number;
}

export const CanvasNodeLabel = ({ id, label, richLabel, isEditing, measured, commentCount }: ICanvasNodeLabelProps) => {
  const t = useTranslations();
  const { labelRefCallback, expanded, expandable, toggleExpanded } = useExpandableLabel();

  return (
    <>
      <div className="flex min-w-0 items-start gap-2">
        {isEditing ? (
          <NodeLabelEditor
            id={id}
            label={label}
            richLabel={richLabel}
            measured={measured}
            ariaLabel={t.platform.canvas.node.labelAriaLabel}
            className="text-[13.5px] leading-[1.55] font-medium"
            signalLabelled
          />
        ) : (
          <RichText
            ref={labelRefCallback}
            text={label}
            document={richLabel}
            className={clsx(
              'min-w-0 flex-1 font-grotesk text-[13.5px] leading-[1.55] font-medium tracking-tight break-words whitespace-pre-wrap text-[color:var(--text-strong)] select-none',
              !expanded && 'line-clamp-10',
            )}
          />
        )}

        {!isEditing && <CommentsButton nodeId={id} count={commentCount} />}
      </div>

      {!isEditing && expandable && <ExpandToggle expanded={expanded} onToggle={toggleExpanded} />}
    </>
  );
};
