'use client';

import { useId } from 'react';

import { NODI_BAND_HEIGHT, NODI_BODY } from '../consts';

export const NodiBody = () => {
  const clipId = `${useId()}-nodi`;

  return (
    <>
      <clipPath id={clipId}>
        <rect {...NODI_BODY} />
      </clipPath>

      <rect {...NODI_BODY} fill="var(--surface)" />

      <rect
        clipPath={`url(#${clipId})`}
        x={NODI_BODY.x}
        y={NODI_BODY.y}
        width={NODI_BODY.width}
        height={NODI_BAND_HEIGHT}
        fill="var(--accent)"
      />

      <rect {...NODI_BODY} fill="none" stroke="var(--border-strong)" strokeWidth="1.4" />
    </>
  );
};
