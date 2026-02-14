import { useTranslations } from '@/lib/hooks';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  { key: 'twitter', href: '#' },
  { key: 'github', href: '#' },
  { key: 'docs', href: '#' },
] as const;

export const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="border-t border-black/5 bg-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-sm font-medium text-black/40">
            © {CURRENT_YEAR} {t.landing.header.logo}
          </div>
          <nav className="flex gap-10 text-sm font-medium text-black/60">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="transition-colors hover:text-black hover:underline"
              >
                {t.landing.footer.links[link.key]}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
