import { BADGES } from '@constants';
import { Badge } from '@/components';
import { useTranslations } from '@/i18n';

interface IFounderBadgeProps {
  earned: boolean;
}

export const FounderBadge = ({ earned }: IFounderBadgeProps) => {
  const { badges } = useTranslations().platform.settings.profile;
  const [founder] = BADGES;

  if (!founder) return null;

  return (
    <div className="w-36">
      <Badge icon={founder.icon} label={badges[founder.labelKey]} unlock={badges[founder.unlockKey]} earned={earned} />
    </div>
  );
};
