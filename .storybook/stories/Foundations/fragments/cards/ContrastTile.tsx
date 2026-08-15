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
    <span className="font-mono-ui text-[8.5px] font-semibold tracking-[0.22em] uppercase opacity-80">{caption}</span>
    <span className="font-grotesk text-[18px] leading-none font-semibold tracking-[-0.01em]">{label}</span>
  </div>
);
