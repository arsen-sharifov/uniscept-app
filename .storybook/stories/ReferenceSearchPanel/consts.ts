import type { INodeReference } from '@interfaces';
import { createNodeReference } from '../../utils';

export const referenceNodes: INodeReference[] = [
  createNodeReference('1', 'Voting balances authority across all members of a thread.', 'Governance model', 'Research'),
  createNodeReference('2', 'Provenance keeps reasoning auditable over time.', 'Governance model', 'Research'),
  createNodeReference('3', 'Qualified majority balances speed and inclusion.', 'Decision making', 'Research'),
  createNodeReference('4', 'Mandatory provenance blocks quick drafts.', 'Drafting workflow', 'Product'),
  createNodeReference('5', 'Require provenance on publish, not on draft.', 'Drafting workflow', 'Product'),
  createNodeReference('6', 'Reference nodes preserve linkage across threads.', 'Cross-thread linkage', 'Product'),
];

export const emptyReferenceNodes: INodeReference[] = [];
