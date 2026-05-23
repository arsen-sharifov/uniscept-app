import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface IStepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: IStepperProps) => {
  return (
    <div role="list" className="flex items-center">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = currentStep >= num;
        const isDone = currentStep > num;
        const isCurrent = currentStep === num;
        const isLast = i === steps.length - 1;

        return (
          <div
            key={label}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
            className={clsx('flex items-center', !isLast && 'flex-1')}
          >
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                  isActive
                    ? 'bg-[color:var(--accent)] text-[color:var(--on-accent)]'
                    : 'border-2 border-[color:var(--border-strong)] text-[color:var(--text-subtle)]',
                )}
              >
                {isDone ? (
                  <>
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">Completed</span>
                  </>
                ) : (
                  num
                )}
              </div>
              <span
                className={clsx(
                  'text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]',
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={clsx(
                  'mx-4 h-0.5 flex-1 rounded-full transition-colors duration-200',
                  isDone ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--border)]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
