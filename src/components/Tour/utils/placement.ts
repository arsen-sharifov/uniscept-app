import type { IAnchorRect, ISize, ITourCardPosition, TTourPlacement } from '@interfaces';
import { TOUR_CARD_GAP, TOUR_VIEWPORT_MARGIN } from '@constants';

import { OPPOSITE_PLACEMENT } from '../consts';

const clamp = (value: number, size: number, extent: number): number =>
  Math.min(Math.max(value, TOUR_VIEWPORT_MARGIN), Math.max(TOUR_VIEWPORT_MARGIN, extent - size - TOUR_VIEWPORT_MARGIN));

const clampPosition = ({ top, left }: ITourCardPosition, size: ISize, viewport: ISize): ITourCardPosition => ({
  left: clamp(left, size.width, viewport.width),
  top: clamp(top, size.height, viewport.height),
});

const unanchored = ({ width, height }: ISize, viewport: ISize): ITourCardPosition => ({
  left: clamp((viewport.width - width) / 2, width, viewport.width),
  top: clamp(viewport.height - height - TOUR_CARD_GAP * 3, height, viewport.height),
});

const centered = ({ width, height }: ISize, viewport: ISize): ITourCardPosition => ({
  left: clamp((viewport.width - width) / 2, width, viewport.width),
  top: clamp((viewport.height - height) / 2, height, viewport.height),
});

const beside = (rect: IAnchorRect, placement: TTourPlacement, { width, height }: ISize): ITourCardPosition => {
  if (placement === 'left') {
    return { left: rect.left - TOUR_CARD_GAP - width, top: rect.top + rect.height / 2 - height / 2 };
  }

  if (placement === 'right') {
    return { left: rect.left + rect.width + TOUR_CARD_GAP, top: rect.top + rect.height / 2 - height / 2 };
  }

  if (placement === 'top') {
    return { left: rect.left + rect.width / 2 - width / 2, top: rect.top - TOUR_CARD_GAP - height };
  }

  return { left: rect.left + rect.width / 2 - width / 2, top: rect.top + rect.height + TOUR_CARD_GAP };
};

const hasRoom = (position: ITourCardPosition, placement: TTourPlacement, size: ISize, viewport: ISize): boolean => {
  if (placement === 'left' || placement === 'right') {
    return position.left >= TOUR_VIEWPORT_MARGIN && position.left + size.width <= viewport.width - TOUR_VIEWPORT_MARGIN;
  }

  return position.top >= TOUR_VIEWPORT_MARGIN && position.top + size.height <= viewport.height - TOUR_VIEWPORT_MARGIN;
};

export const placeCard = (
  rect: IAnchorRect | null,
  placement: TTourPlacement,
  size: ISize,
  viewport: ISize,
): ITourCardPosition => {
  if (placement === 'center') return centered(size, viewport);

  if (!rect || size.width === 0) return unanchored(size, viewport);

  const preferred = beside(rect, placement, size);
  if (hasRoom(preferred, placement, size, viewport)) return clampPosition(preferred, size, viewport);

  const opposite = OPPOSITE_PLACEMENT[placement];
  const flipped = beside(rect, opposite, size);
  if (hasRoom(flipped, opposite, size, viewport)) return clampPosition(flipped, size, viewport);

  return unanchored(size, viewport);
};
