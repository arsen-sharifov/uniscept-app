interface ISnapDioramaProps {
  active: boolean;
}

export const SnapDiorama = ({ active }: ISnapDioramaProps) => (
  <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full" aria-hidden>
    {[40, 70, 100, 130, 160].map((x) =>
      [20, 40, 60].map((y) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="1.3"
          fill="var(--text-faint)"
          style={{
            opacity: active ? 0.85 : 0.32,
            transition: 'opacity 300ms ease-out',
          }}
        />
      )),
    )}
    <g
      stroke="var(--accent)"
      strokeWidth="0.6"
      strokeDasharray="2.5 3"
      style={{ opacity: active ? 0.65 : 0, transition: 'opacity 220ms ease-out' }}
    >
      <line x1="100" y1="8" x2="100" y2="72" />
      <line x1="26" y1="40" x2="174" y2="40" />
    </g>
    <g
      style={{
        transform: active ? 'translate(100px, 40px)' : 'translate(108px, 33px)',
        transition: 'transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <rect
        x="-20"
        y="-11"
        width="40"
        height="22"
        rx="3.5"
        fill="var(--surface-elevated)"
        stroke="var(--accent)"
        strokeWidth="1.1"
      />
      <rect x="-14" y="-6" width="28" height="2" rx="1" fill="var(--text-muted)" opacity="0.55" />
      <rect x="-14" y="-1.5" width="20" height="2" rx="1" fill="var(--text-muted)" opacity="0.32" />
      <rect x="-14" y="3" width="24" height="2" rx="1" fill="var(--text-muted)" opacity="0.28" />
    </g>
  </svg>
);
