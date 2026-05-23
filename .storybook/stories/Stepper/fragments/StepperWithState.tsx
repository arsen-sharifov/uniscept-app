import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { Stepper } from '@/components';

export const StepperWithState = () => {
  const [{ currentStep, steps }, updateArgs] = useArgs<{ steps: string[]; currentStep: number }>();
  const onBack = fn();
  const onNext = fn();
  const current = currentStep ?? 1;
  const total = steps?.length ?? 1;

  return (
    <div className="space-y-6">
      <Stepper steps={steps ?? []} currentStep={current} />
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            const next = Math.max(1, current - 1);
            onBack(next);
            updateArgs({ currentStep: next });
          }}
          disabled={current === 1}
          className="rounded-lg border border-[color:var(--border-strong)] px-4 py-1.5 text-[13px] font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-overlay)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            const next = Math.min(total, current + 1);
            onNext(next);
            updateArgs({ currentStep: next });
          }}
          disabled={current === total}
          className="rounded-lg bg-[color:var(--accent)] px-4 py-1.5 text-[13px] font-medium text-[color:var(--on-accent)] shadow-[0_6px_14px_-8px_var(--accent-glow)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <p className="text-center font-mono text-[10.5px] tracking-[0.2em] text-[color:var(--text-subtle)] uppercase">
        step {current} of {total}
      </p>
    </div>
  );
};
