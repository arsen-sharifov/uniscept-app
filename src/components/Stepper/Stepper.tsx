import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface IStepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: IStepperProps) => {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = currentStep >= num;
        const isDone = currentStep > num;
        const isLast = i === steps.length - 1;

        return (
          <div
            key={label}
            className={clsx('flex items-center', !isLast && 'flex-1')}
          >
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                  isActive
                    ? 'bg-black text-white'
                    : 'border-2 border-black/15 text-black/30'
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <span
                className={clsx(
                  'text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-black' : 'text-black/40'
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={clsx(
                  'mx-4 h-0.5 flex-1 rounded-full transition-colors duration-200',
                  isDone ? 'bg-black' : 'bg-black/10'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
