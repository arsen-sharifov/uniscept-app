import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
      <Sidebar />
      <Toolbar />
      {children}
    </div>
  );
}
