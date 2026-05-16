import type {
  IColorGroup,
  IRadiusToken,
  IShadowToken,
  ISpacingToken,
  IThemeMeta,
  ITypeRow,
  TPatternVariant,
} from '@story-interfaces';

export const THEME_LIST: readonly IThemeMeta[] = [
  { id: 'daybreak', name: 'Daybreak', caption: 'Crisp paper, soft light', mode: 'light' },
  { id: 'eclipse', name: 'Eclipse', caption: 'Inky night, cyan flare', mode: 'dark' },
  { id: 'graphite', name: 'Graphite', caption: 'Pure monochrome', mode: 'dark' },
  { id: 'solstice', name: 'Solstice', caption: 'Warm parchment, amber', mode: 'light' },
  { id: 'aurora', name: 'Aurora', caption: 'Iridescent glass', mode: 'light' },
  { id: 'auto', name: 'Auto', caption: 'Follows the system', mode: 'adaptive' },
];

export const COLOR_GROUPS: readonly IColorGroup[] = [
  {
    id: 'surface',
    title: 'Surface',
    description: 'The matter of the workspace — backdrops, cards, overlays.',
    tokens: [
      { variable: '--app-bg', label: 'App background', role: 'Root canvas tone' },
      { variable: '--app-bg-tint', label: 'App tint', role: 'Side panels, sidebar wash' },
      { variable: '--app-bg-grid', label: 'Grid stroke', role: 'Canvas pattern color' },
      { variable: '--surface', label: 'Surface', role: 'Modals, dialogs' },
      { variable: '--surface-soft', label: 'Surface soft', role: 'Quiet sections' },
      { variable: '--surface-elevated', label: 'Surface elevated', role: 'Cards, popovers' },
      { variable: '--surface-overlay', label: 'Surface overlay', role: 'Hover, pressed states' },
    ],
  },
  {
    id: 'text',
    title: 'Text',
    description: 'A descending scale from titling weight to whisper.',
    tokens: [
      { variable: '--text-strong', label: 'Strong', role: 'Headings, primary metrics' },
      { variable: '--text', label: 'Body', role: 'Paragraphs, default copy' },
      { variable: '--text-muted', label: 'Muted', role: 'Secondary, captions' },
      { variable: '--text-subtle', label: 'Subtle', role: 'Section labels, eyebrows' },
      { variable: '--text-faint', label: 'Faint', role: 'Decorative, dividers' },
    ],
  },
  {
    id: 'border',
    title: 'Borders & Rings',
    description: 'Edges that breathe — thin contours that scale with theme.',
    tokens: [
      { variable: '--border', label: 'Border', role: 'Default panel edge' },
      { variable: '--border-strong', label: 'Border strong', role: 'Hover, focused' },
      { variable: '--border-active', label: 'Border active', role: 'Selected card frame' },
      { variable: '--ring-focus', label: 'Ring focus', role: 'Keyboard focus ring' },
    ],
  },
  {
    id: 'accent',
    title: 'Accent',
    description: 'Primary signal color, theme-bound.',
    tokens: [
      { variable: '--accent', label: 'Accent', role: 'Buttons, active states' },
      { variable: '--accent-strong', label: 'Accent strong', role: 'Hover, depth' },
      { variable: '--accent-text', label: 'Accent text', role: 'Text on soft accent fields' },
      { variable: '--accent-soft', label: 'Accent soft', role: 'Tinted backgrounds' },
      { variable: '--accent-glow', label: 'Accent glow', role: 'Halos, focus shadows' },
      { variable: '--accent-2', label: 'Accent 2', role: 'Gradient companion' },
      { variable: '--on-accent', label: 'On accent', role: 'Foreground on accent fill' },
    ],
  },
  {
    id: 'status',
    title: 'Status',
    description: 'Feedback semantics — success, warning, error.',
    tokens: [
      { variable: '--status-success', label: 'Success', role: 'Positive emphasis' },
      { variable: '--status-success-bg', label: 'Success bg', role: 'Toast / pill background' },
      { variable: '--status-success-border', label: 'Success border', role: 'Edge of success surface' },
      { variable: '--status-success-soft', label: 'Success soft', role: 'Hover/active' },
      { variable: '--status-warning', label: 'Warning', role: 'Cautionary copy' },
      { variable: '--status-warning-bg', label: 'Warning bg', role: 'Toast background' },
      { variable: '--status-warning-border', label: 'Warning border', role: 'Edge' },
      { variable: '--status-warning-soft', label: 'Warning soft', role: 'Hover/active' },
      { variable: '--status-error', label: 'Error', role: 'Destructive copy' },
      { variable: '--status-error-bg', label: 'Error bg', role: 'Toast background' },
      { variable: '--status-error-border', label: 'Error border', role: 'Edge' },
      { variable: '--status-error-soft', label: 'Error soft', role: 'Hover/active' },
    ],
  },
  {
    id: 'reference',
    title: 'Reference',
    description: 'Cross-canvas reference link semantics.',
    tokens: [
      { variable: '--ref', label: 'Reference', role: 'Link color, ref node body' },
      { variable: '--ref-bg', label: 'Reference bg', role: 'Pill background' },
      { variable: '--ref-border', label: 'Reference border', role: 'Edge' },
      { variable: '--ref-soft', label: 'Reference soft', role: 'Hover/active' },
    ],
  },
];

export const TYPE_SCALE: readonly ITypeRow[] = [
  {
    token: 'display/serif',
    sample: 'Structured Reasoning',
    family: 'serif',
    classes: 'font-serif italic text-[40px] leading-[1.05] tracking-tight',
    size: '40px',
    leading: '1.05',
    tracking: '-0.01em',
    weight: '400',
    usage: 'Hero titles, theme & pattern card labels.',
    italic: true,
  },
  {
    token: 'h1/serif',
    sample: 'Atlas of forms',
    family: 'serif',
    classes: 'font-serif italic text-[28px] leading-[1.1] tracking-tight',
    size: '28px',
    leading: '1.1',
    tracking: '-0.005em',
    weight: '400',
    usage: 'Section heads, modal titles.',
    italic: true,
  },
  {
    token: 'h2/sans',
    sample: 'Workspace settings',
    family: 'sans',
    classes: 'text-[20px] font-bold tracking-tight',
    size: '20px',
    leading: '1.2',
    tracking: '-0.005em',
    weight: '700',
    usage: 'Modal h2 (e.g. settings panel title).',
  },
  {
    token: 'body/sans',
    sample: 'Pick the surface your ideas live on. From quiet paper to a charted grid.',
    family: 'sans',
    classes: 'text-[12.5px] leading-relaxed',
    size: '12.5px',
    leading: '1.6',
    tracking: '0',
    weight: '400',
    usage: 'Section blurbs, descriptive paragraphs.',
  },
  {
    token: 'label/sans',
    sample: 'Folder',
    family: 'sans',
    classes: 'text-[13px] font-medium tracking-tight',
    size: '13px',
    leading: '1.3',
    tracking: '-0.005em',
    weight: '500',
    usage: 'Sidebar items, list rows, button labels.',
  },
  {
    token: 'eyebrow/sans-mono',
    sample: 'Appearance',
    family: 'sans',
    classes: 'text-[11px] font-semibold tracking-[0.18em] uppercase',
    size: '11px',
    leading: '1.2',
    tracking: '0.18em',
    weight: '600',
    usage: 'Section eyebrow above headers.',
    uppercase: true,
  },
  {
    token: 'caption/mono',
    sample: 'Six moods',
    family: 'mono',
    classes: 'font-mono text-[10.5px] tracking-[0.16em] uppercase',
    size: '10.5px',
    leading: '1.2',
    tracking: '0.16em',
    weight: '400',
    usage: 'Side captions, intro labels.',
    uppercase: true,
  },
  {
    token: 'badge/mono',
    sample: 'EN · UK · RO',
    family: 'mono',
    classes: 'font-mono text-[10.5px] font-semibold tracking-[0.06em]',
    size: '10.5px',
    leading: '1.0',
    tracking: '0.06em',
    weight: '600',
    usage: 'Badges (locale chips, key codes).',
  },
  {
    token: 'micro/mono',
    sample: 'DEFAULT',
    family: 'mono',
    classes: 'font-mono text-[8.5px] font-semibold tracking-[0.22em] uppercase',
    size: '8.5px',
    leading: '1.0',
    tracking: '0.22em',
    weight: '600',
    usage: 'Pip badges, "default" markers.',
    uppercase: true,
  },
];

export const RADIUS_SCALE: readonly IRadiusToken[] = [
  { label: 'sm', className: 'rounded-md', pixels: '6px', usage: 'Pills, inline chips' },
  { label: 'base', className: 'rounded-lg', pixels: '8px', usage: 'Buttons, code blocks' },
  { label: 'lg', className: 'rounded-xl', pixels: '12px', usage: 'Cards' },
  { label: 'xl', className: 'rounded-2xl', pixels: '16px', usage: 'Modals, theme cards' },
  { label: 'full', className: 'rounded-full', pixels: '∞', usage: 'Avatars, pip badges' },
];

export const SHADOW_TOKENS: readonly IShadowToken[] = [
  { variable: '--shadow-modal', label: 'Modal', usage: 'Floating dialogs, settings modal' },
  { variable: '--shadow-card-hover', label: 'Card hover', usage: 'Theme/pattern card lift on hover' },
  { variable: '--shadow-pip', label: 'Pip', usage: 'Tiny floating chips, language code' },
];

export const SPACING_TOKENS: readonly ISpacingToken[] = [
  { label: '0.5', className: 'p-0.5', rem: '0.125rem', pixels: '2px', usage: 'Hairline insets' },
  { label: '1', className: 'p-1', rem: '0.25rem', pixels: '4px', usage: 'Tight icon padding' },
  { label: '2', className: 'p-2', rem: '0.5rem', pixels: '8px', usage: 'Compact controls' },
  { label: '3', className: 'p-3', rem: '0.75rem', pixels: '12px', usage: 'Buttons, list rows' },
  { label: '4', className: 'p-4', rem: '1rem', pixels: '16px', usage: 'Cards' },
  { label: '6', className: 'p-6', rem: '1.5rem', pixels: '24px', usage: 'Card panels' },
  { label: '8', className: 'p-8', rem: '2rem', pixels: '32px', usage: 'Section padding' },
  { label: '10', className: 'p-10', rem: '2.5rem', pixels: '40px', usage: 'Modal body padding' },
];

export const PATTERN_VARIANTS = ['dots', 'lines', 'cross', 'none'] as const;
export type TPatternVariant = (typeof PATTERN_VARIANTS)[number];

export const PATTERN_CAPTIONS: Record<TPatternVariant, { label: string; description: string }> = {
  dots: { label: 'Dots', description: 'Soft pips, quiet horizon — the workspace default.' },
  lines: { label: 'Lines', description: 'Engineer’s graph paper — precise, gridded thinking.' },
  cross: { label: 'Cross', description: 'Surveyor’s crosshatch — feels like a map.' },
  none: { label: 'Void', description: 'Pure surface, unburdened by texture.' },
};

export const CONTRAST_PAIRS: { label: string; caption: string; bgVar: string; fgVar: string }[] = [
  { label: 'Atlas', caption: 'accent · app-bg', bgVar: '--app-bg', fgVar: '--accent' },
  { label: 'Headline', caption: 'strong · app-bg', bgVar: '--app-bg', fgVar: '--text-strong' },
  { label: 'Caption', caption: 'muted · surface', bgVar: '--surface-elevated', fgVar: '--text-muted' },
  { label: 'Alert', caption: 'error · error-bg', bgVar: '--status-error-bg', fgVar: '--status-error' },
  { label: 'CTA', caption: 'on-accent · accent', bgVar: '--accent', fgVar: '--on-accent' },
];

export const FAMILY_BADGE: Record<'sans' | 'serif' | 'mono', string> = {
  sans: 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)] ring-[color:var(--accent)]/30',
  serif:
    'bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] ring-[color:var(--status-warning-border)]',
  mono: 'bg-[color:var(--ref-bg)] text-[color:var(--ref)] ring-[color:var(--ref-border)]',
};

export const THEMES_SECTIONS = [
  { id: 'specimen', label: 'Specimen' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'contrast', label: 'Contrast' },
  { id: 'application', label: 'Application' },
];

export const PATTERNS_SECTIONS = [
  { id: 'stage', label: 'Stage' },
  { id: 'variants', label: 'Variants' },
  { id: 'across', label: 'Across themes' },
  { id: 'radius', label: 'Radius' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'spacing', label: 'Spacing' },
];

export const TYPOGRAPHY_SECTIONS = [
  { id: 'voices', label: 'Voices' },
  { id: 'scale', label: 'Scale' },
  { id: 'composition', label: 'Composition' },
  { id: 'decoration', label: 'Decoration' },
];

export const TYPOGRAPHY_TABLE_COLUMNS = [
  { id: 'token', label: 'Token', width: '180px' },
  { id: 'sample', label: 'Sample', width: 'minmax(0, 1.4fr)' },
  { id: 'specs', label: 'Specs', width: '170px' },
  { id: 'classes', label: 'Classes', width: 'minmax(0, 1fr)' },
  { id: 'usage', label: 'Usage', width: 'minmax(0, 1.3fr)' },
];

export const RADIUS_TABLE_COLUMNS = [
  { id: 'preview', label: 'Preview', width: '110px' },
  { id: 'token', label: 'Token', width: '110px' },
  { id: 'class', label: 'Class', width: '170px' },
  { id: 'value', label: 'Value', width: '90px' },
  { id: 'usage', label: 'Usage', width: 'minmax(0, 1fr)' },
];

export const SHADOW_TABLE_COLUMNS = [
  { id: 'preview', label: 'Preview', width: '110px' },
  { id: 'label', label: 'Label', width: '140px' },
  { id: 'var', label: 'Variable', width: '220px' },
  { id: 'usage', label: 'Usage', width: 'minmax(0, 1fr)' },
];

export const SPACING_TABLE_COLUMNS = [
  { id: 'step', label: 'Step', width: '70px' },
  { id: 'class', label: 'Class', width: '120px' },
  { id: 'rem', label: 'rem', width: '80px' },
  { id: 'px', label: 'px', width: '60px' },
  { id: 'bar', label: 'Bar', width: '140px' },
  { id: 'usage', label: 'Usage', width: 'minmax(0, 1fr)' },
];
