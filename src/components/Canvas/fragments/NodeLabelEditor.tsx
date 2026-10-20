'use client';

import { clsx } from 'clsx';

import type { IRichTextDocument } from '@interfaces';

import { RichText } from '@/components/RichText';
import { RichTextEditor } from '@/components/RichTextEditor';
import { MAX_NODE_LABEL_LENGTH } from '@/lib/canvas';

import { useLabelEditing } from '../hooks';

interface INodeLabelEditorProps {
  id: string;
  label: string;
  richLabel?: IRichTextDocument;
  measured: boolean;
  ariaLabel: string;
  className: string;
  placeholder?: string;
  signalLabelled?: boolean;
}

export const NodeLabelEditor = ({
  id,
  label,
  richLabel,
  measured,
  ariaLabel,
  className,
  placeholder,
  signalLabelled,
}: INodeLabelEditorProps) => {
  const { commitLabel, cancelEditing } = useLabelEditing({ id, label, richLabel, signalLabelled });

  const textClassName = clsx(
    'font-grotesk tracking-tight break-words text-[color:var(--text-strong)] caret-[color:var(--accent)]',
    className,
  );

  return (
    <RichTextEditor
      text={label}
      document={richLabel}
      ariaLabel={ariaLabel}
      placeholder={placeholder}
      maxLength={MAX_NODE_LABEL_LENGTH}
      autoFocus={measured}
      className={textClassName}
      onSubmit={commitLabel}
      onLeave={commitLabel}
      onCancel={cancelEditing}
      fallback={
        <RichText
          text={label}
          document={richLabel}
          className={clsx('w-full min-w-0 whitespace-pre-wrap', textClassName)}
        />
      }
    />
  );
};
