interface IContrastTileProps {
  label: string;
  caption: string;
  bgVar: string;
  fgVar: string;
}

export const ContrastTile = ({ label, caption, bgVar, fgVar }: IContrastTileProps) => (
  <div
    className="flex h-20 flex-col justify-between rounded-lg p-3"
    style={{ backgroundColor: `var(${bgVar})`, color: `var(${fgVar})` }}
  >
    <span className="font-mono text-[8.5px] font-semibold tracking-[0.22em] uppercase opacity-80">{caption}</span>
    <span className="font-serif text-[18px] leading-none tracking-[-0.01em] italic">{label}</span>
  </div>
);
