import type { NavItem } from '@/components/Sidebar';

export const fullTree: NavItem[] = [
  {
    type: 'folder',
    id: 'f1',
    name: 'Research',
    items: [
      { type: 'topic', id: 'f1-t1', name: 'AI Ethics' },
      {
        type: 'folder',
        id: 'f1-f1',
        name: 'Competitors',
        items: [
          { type: 'topic', id: 'f1-f1-t1', name: 'Feature Matrix' },
          { type: 'topic', id: 'f1-f1-t2', name: 'Market Share' },
        ],
      },
    ],
  },
  { type: 'topic', id: 't1', name: 'Product Strategy' },
  {
    type: 'folder',
    id: 'f2',
    name: 'Engineering',
    items: [
      { type: 'topic', id: 'f2-t1', name: 'System Design' },
      { type: 'topic', id: 'f2-t2', name: 'API Architecture' },
      {
        type: 'folder',
        id: 'f2-f1',
        name: 'Database',
        items: [
          { type: 'topic', id: 'f2-f1-t1', name: 'Schema Design' },
          { type: 'topic', id: 'f2-f1-t2', name: 'Migrations' },
        ],
      },
    ],
  },
  {
    type: 'folder',
    id: 'f3',
    name: 'Team',
    items: [
      { type: 'topic', id: 'f3-t1', name: 'Hiring Plan' },
      {
        type: 'folder',
        id: 'f3-f1',
        name: 'Q1 2026',
        items: [
          { type: 'topic', id: 'f3-f1-t1', name: 'Engineering Roles' },
          { type: 'topic', id: 'f3-f1-t2', name: 'Onboarding Flow' },
        ],
      },
    ],
  },
  { type: 'topic', id: 't2', name: 'Investor Thesis' },
];

export const flatTopics: NavItem[] = [
  { type: 'topic', id: 't1', name: 'Meeting Notes' },
  { type: 'topic', id: 't2', name: 'Design Review' },
  { type: 'topic', id: 't3', name: 'Sprint Retro' },
  { type: 'topic', id: 't4', name: 'Product Roadmap' },
  { type: 'topic', id: 't5', name: 'Quarterly Goals' },
];

export const deepTree: NavItem[] = [
  {
    type: 'folder',
    id: 'd1',
    name: 'Level 1',
    items: [
      {
        type: 'folder',
        id: 'd2',
        name: 'Level 2',
        items: [
          {
            type: 'folder',
            id: 'd3',
            name: 'Level 3',
            items: [
              {
                type: 'folder',
                id: 'd4',
                name: 'Level 4',
                items: [
                  {
                    type: 'folder',
                    id: 'd5',
                    name: 'Level 5',
                    items: [{ type: 'topic', id: 'd5-t1', name: 'Deep Topic' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const manyItems: NavItem[] = Array.from({ length: 30 }, (_, i) => ({
  type: 'topic' as const,
  id: `scroll-t${i}`,
  name: `Topic ${i + 1}: ${['Analysis', 'Review', 'Planning', 'Research', 'Design'][i % 5]}`,
}));
