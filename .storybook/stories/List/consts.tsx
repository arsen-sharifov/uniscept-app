import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export function SimpleTrigger(label: string) {
  return function TriggerButton(open: boolean, toggle: () => void) {
    return (
      <button
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/70 transition-colors hover:bg-black/5"
      >
        <ChevronRight
          className={clsx(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
        <span>{label}</span>
      </button>
    );
  };
}

export function SampleContent({ text }: { text: string }) {
  return (
    <div className="ml-6 border-l border-black/5 py-1 pl-3 text-sm text-black/50">
      {text}
    </div>
  );
}
