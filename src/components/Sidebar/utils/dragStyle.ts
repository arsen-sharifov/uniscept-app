import type { CSSProperties } from 'react';
import type { Transform } from '@dnd-kit/utilities';
import { CSS } from '@dnd-kit/utilities';

export const getDragTransformStyle = (
  transform: Transform | null,
  transition: string | undefined,
  isDragActive: boolean
): Pick<CSSProperties, 'transform' | 'transition'> => {
  if (isDragActive) return { transform: undefined, transition: undefined };

  return {
    transform: CSS.Transform.toString(
      transform ? { ...transform, scaleX: 1, scaleY: 1 } : null
    ),
    transition,
  };
};
