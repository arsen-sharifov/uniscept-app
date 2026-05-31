'use client';

import { useReactFlow } from '@xyflow/react';
import { useMemo } from 'react';

import type { IAlignmentGuide } from '@interfaces';

import { ALIGN_GUIDE_DASH_ARRAY, ALIGN_GUIDE_FALLBACK_COLOR, ALIGN_GUIDE_STROKE_WIDTH } from '../consts';
import { useThemeToken } from '../hooks';

interface IAlignmentGuidesProps {
  guides: readonly IAlignmentGuide[];
}

export const AlignmentGuides = ({ guides }: IAlignmentGuidesProps) => {
  const { flowToScreenPosition } = useReactFlow();
  const stroke = useThemeToken('--accent', ALIGN_GUIDE_FALLBACK_COLOR);

  const segments = useMemo(
    () =>
      guides.map((guide, index) => {
        if (guide.direction === 'vertical') {
          const head = flowToScreenPosition({ x: guide.position, y: guide.start });
          const tail = flowToScreenPosition({ x: guide.position, y: guide.end });

          return { id: `v-${index}`, x1: head.x, y1: head.y, x2: tail.x, y2: tail.y };
        }

        const head = flowToScreenPosition({ x: guide.start, y: guide.position });
        const tail = flowToScreenPosition({ x: guide.end, y: guide.position });

        return { id: `h-${index}`, x1: head.x, y1: head.y, x2: tail.x, y2: tail.y };
      }),
    [guides, flowToScreenPosition],
  );

  if (segments.length === 0) {
    return null;
  }

  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-30" width="100%" height="100%">
      {segments.map(({ id, x1, y1, x2, y2 }) => (
        <line
          key={id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={ALIGN_GUIDE_STROKE_WIDTH}
          strokeDasharray={ALIGN_GUIDE_DASH_ARRAY}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
