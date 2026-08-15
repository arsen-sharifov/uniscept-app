interface IAuthHeadingProps {
  title: string;
  subtitle: string;
}

export const AuthHeading = ({ title, subtitle }: IAuthHeadingProps) => (
  <div className="mb-8 text-center">
    <h1 className="font-grotesk text-2xl font-bold tracking-tight text-[color:var(--hero-title)]">{title}</h1>
    <p className="mt-1 font-grotesk text-sm text-[color:var(--hero-ground-muted)]">{subtitle}</p>
  </div>
);
