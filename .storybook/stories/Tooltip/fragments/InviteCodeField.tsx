import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';

interface IInviteCodeFieldProps {
  text?: string;
  position?: 'top' | 'bottom';
}

export const InviteCodeField = ({ text, position }: IInviteCodeFieldProps) => {
  const { inviteCode, inviteCodeTooltip } = useTranslations().auth.signUp.accountStep;

  return (
    <div className="flex items-center gap-1.5 text-[color:var(--text)]">
      <span className="text-[13px] font-medium">{inviteCode}</span>
      <Tooltip text={text ?? inviteCodeTooltip} position={position} />
    </div>
  );
};
