'use client';

import type { IDragSelectRect } from '@interfaces';

interface IDragSelectOverlayProps {
  rect: IDragSelectRect | null;
}

export const DragSelectOverlay = ({ rect }: IDragSelectOverlayProps) => {
  if (!rect) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded border border-emerald-500/30 bg-emerald-500/8"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
};
