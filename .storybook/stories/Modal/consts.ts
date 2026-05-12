import type { IModalTab } from '@story-interfaces';

export const MODAL_TABS: readonly IModalTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    body: 'High-level summary of the workspace, plan tier, and seat usage. Useful when surfacing context inside a settings shell.',
  },
  {
    id: 'members',
    label: 'Members',
    body: 'Roster of collaborators with their roles. In production this slot is replaced with a virtualised list and an invite button.',
  },
  {
    id: 'billing',
    label: 'Billing',
    body: 'Current plan, next renewal date, and a link to manage the subscription via Stripe customer portal.',
  },
];
