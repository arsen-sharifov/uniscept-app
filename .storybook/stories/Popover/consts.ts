import type { TPopoverPlacement } from '@interfaces';

export const PLACEMENTS: { id: TPopoverPlacement; label: string }[] = [
  { id: 'bottom-start', label: 'Bottom · start' },
  { id: 'bottom-end', label: 'Bottom · end' },
  { id: 'top-start', label: 'Top · start' },
  { id: 'top-end', label: 'Top · end' },
];

export const SEARCHABLE_REFERENCES = [
  'Premises of structural reasoning',
  'Why provenance matters',
  'Reference: governance loop',
  'Sources for the dataset',
  'Discussion: voting threshold',
  'Notes from the 2026 audit',
  'Topic graph — pre-merge snapshot',
  'Plan tiers and seat policies',
];

export const SAMPLE_REFERENCES = SEARCHABLE_REFERENCES.slice(0, 6);
