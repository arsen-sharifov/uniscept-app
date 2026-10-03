import type { TEdgeTone } from '@interfaces';

import { ARROW_MARKER_ATTRIBUTES, ARROW_PATH_D } from '@/lib/canvas';

import { EDGE_TONES } from '../consts';

interface IEdgeMarkersProps {
  palette: Record<TEdgeTone, string>;
}

export const EdgeMarkers = ({ palette }: IEdgeMarkersProps) => (
  <svg aria-hidden width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
    <defs>
      {EDGE_TONES.map((tone) => (
        <marker key={tone} id={`canvas-arrow-${tone}`} {...ARROW_MARKER_ATTRIBUTES}>
          <path d={ARROW_PATH_D} fill={palette[tone]} />
        </marker>
      ))}
    </defs>
  </svg>
);
