export const PROBLEM_CARDS = [
  {
    emoji: '💬',
    title: 'Chat is chaos',
    description:
      "Linear conversations can't capture non-linear thinking. Important insights get buried in threads. Context dies in channels. Knowledge evaporates into the void.",
    tags: [
      { label: 'No Structure', color: 'red' },
      { label: 'Lost Context', color: 'orange' },
      { label: 'Zero Validation', color: 'yellow' },
    ],
  },
  {
    emoji: '🗺️',
    title: 'Mind maps are toys',
    description:
      'Pretty diagrams without logical rigor. No validation. No truth tracking.',
    tags: [{ label: 'Just Vibes', color: 'purple' }],
  },
  {
    emoji: '📝',
    title: "Docs don't scale",
    description:
      'Notion pages are write-only memory. Good luck finding that decision from 3 months ago.',
    tags: [],
  },
  {
    emoji: '⚠️',
    title: 'The cost is real',
    description:
      'Billions lost to bad decisions. Hours wasted rehashing. Ideas forgotten forever.',
    tags: [],
  },
] as const;

export const STEPS = [
  {
    number: 1,
    title: 'Create canvas',
    description: 'Start with a question or problem. Simple.',
    color: 'from-emerald-500 to-cyan-500',
  },
  {
    number: 2,
    title: 'Build structure',
    description: 'Add nodes. Draw connections. Make reasoning visible.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    number: 3,
    title: 'Validate paths',
    description: 'Mark what works. Track truth. Build on solid ground.',
    color: 'from-purple-500 to-pink-500',
  },
] as const;
