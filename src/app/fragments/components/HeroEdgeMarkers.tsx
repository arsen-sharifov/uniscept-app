import { ARROW_MARKER_ATTRIBUTES, ARROW_PATH_D } from '@/lib/canvas/consts';

import { HERO_EDGE_MARKER_TONES, HERO_EDGE_TONE_STROKES } from '../consts';

export const HeroEdgeMarkers = () => (
  <svg aria-hidden width="0" height="0" className="absolute overflow-hidden">
    <defs>
      {HERO_EDGE_MARKER_TONES.map((tone) => (
        <marker key={tone} id={`hero-arrow-${tone}`} {...ARROW_MARKER_ATTRIBUTES}>
          <path d={ARROW_PATH_D} fill={HERO_EDGE_TONE_STROKES[tone]} />
        </marker>
      ))}
    </defs>
  </svg>
);
