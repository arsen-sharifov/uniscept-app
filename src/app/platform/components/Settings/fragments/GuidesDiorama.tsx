interface IGuidesDioramaProps {
  active: boolean;
}

export const GuidesDiorama = ({ active }: IGuidesDioramaProps) => (
  <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full" aria-hidden>
    <g opacity="0.55">
      <rect
        x="22"
        y="10"
        width="32"
        height="20"
        rx="2.5"
        fill="var(--surface-elevated)"
        stroke="var(--border-strong)"
        strokeWidth="0.7"
      />
      <rect
        x="146"
        y="50"
        width="32"
        height="20"
        rx="2.5"
        fill="var(--surface-elevated)"
        stroke="var(--border-strong)"
        strokeWidth="0.7"
      />
    </g>
    <g
      stroke="var(--accent)"
      strokeWidth="0.7"
      strokeDasharray="3.5 3"
      strokeLinecap="round"
      style={{
        opacity: active ? 0.9 : 0,
        transition: 'opacity 240ms ease-out',
      }}
    >
      <line x1="38" y1="20" x2="100" y2="20" />
      <line x1="100" y1="20" x2="100" y2="40" />
      <line x1="100" y1="40" x2="162" y2="40" />
      <line x1="162" y1="40" x2="162" y2="60" />
    </g>
    <g transform="translate(100, 40)">
      <rect
        x="-20"
        y="-11"
        width="40"
        height="22"
        rx="3.5"
        fill="var(--surface-elevated)"
        stroke="var(--accent)"
        strokeWidth={active ? 1.2 : 0.7}
        style={{ transition: 'stroke-width 240ms ease-out' }}
      />
      <rect x="-14" y="-6" width="28" height="2" rx="1" fill="var(--text-muted)" opacity="0.55" />
      <rect x="-14" y="-1.5" width="20" height="2" rx="1" fill="var(--text-muted)" opacity="0.32" />
      <rect x="-14" y="3" width="24" height="2" rx="1" fill="var(--text-muted)" opacity="0.28" />
    </g>
  </svg>
);
