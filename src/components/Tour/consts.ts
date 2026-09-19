import { Check, Lock, type LucideIcon, Play } from 'lucide-react';

import type {
  ITourGeometry,
  ITourGeometryState,
  ITourSpeaker,
  TGuideStatus,
  TMascotCharacter,
  TTourButtonSize,
  TTourButtonVariant,
  TTourPlacement,
} from '@interfaces';
import { BADGES, ONBOARDING_BADGE_ID } from '@constants';

export const GUIDE_STATUS_ICONS: Record<TGuideStatus, LucideIcon> = {
  done: Check,
  locked: Lock,
  ready: Play,
};

export const OPPOSITE_PLACEMENT: Record<TTourPlacement, TTourPlacement> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
  center: 'center',
};

export const SPEAKERS: Record<TMascotCharacter, ITourSpeaker> = {
  nodi: { name: 'nodiName', alt: 'nodiAlt', tone: 'var(--accent-text)' },
  ergo: { name: 'ergoName', alt: 'ergoAlt', tone: 'var(--accent-2)' },
};

export const EMPTY_GEOMETRY: ITourGeometry = { rect: null, anchor: null, blocked: null, lit: [], open: [] };

export const INITIAL_GEOMETRY_STATE: ITourGeometryState = { ...EMPTY_GEOMETRY, key: '', lastRect: null, lost: false };

export const ONBOARDING_BADGE = BADGES.find((badge) => badge.id === ONBOARDING_BADGE_ID);

export const TOUR_BUTTON_VARIANTS: Record<TTourButtonVariant, string> = {
  primary: 'bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-opacity hover:opacity-90',
  secondary:
    'border border-[color:var(--border-strong)] text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]',
};

export const TOUR_BUTTON_SIZES: Record<TTourButtonSize, string> = {
  sm: 'px-3.5 text-[12.5px] whitespace-nowrap',
  md: 'px-4 text-sm',
};
