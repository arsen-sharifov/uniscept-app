import {
  BookMarked,
  Brain,
  Building2,
  Compass,
  Feather,
  Flame,
  Footprints,
  Gavel,
  GitFork,
  Languages,
  Link2,
  type LucideIcon,
  MessagesSquare,
  Moon,
  Sparkles,
  Telescope,
  Users2,
} from 'lucide-react';

import type { TBadgeId, TBadgeLabelKey, TBadgeUnlockKey } from '@interfaces';

export const BADGES: readonly {
  id: TBadgeId;
  icon: LucideIcon;
  labelKey: TBadgeLabelKey;
  unlockKey: TBadgeUnlockKey;
}[] = [
  { id: 'founder', icon: Sparkles, labelKey: 'badgeFounder', unlockKey: 'founderUnlock' },
  { id: 'firstSteps', icon: Footprints, labelKey: 'badgeFirstSteps', unlockKey: 'firstStepsUnlock' },
  { id: 'architect', icon: Compass, labelKey: 'badgeArchitect', unlockKey: 'architectUnlock' },
  { id: 'connector', icon: Link2, labelKey: 'badgeConnector', unlockKey: 'connectorUnlock' },
  { id: 'critic', icon: Gavel, labelKey: 'badgeCritic', unlockKey: 'criticUnlock' },
  { id: 'linguist', icon: Languages, labelKey: 'badgeLinguist', unlockKey: 'linguistUnlock' },
  { id: 'curator', icon: BookMarked, labelKey: 'badgeCurator', unlockKey: 'curatorUnlock' },
  { id: 'voice', icon: MessagesSquare, labelKey: 'badgeVoice', unlockKey: 'voiceUnlock' },
  { id: 'explorer', icon: Telescope, labelKey: 'badgeExplorer', unlockKey: 'explorerUnlock' },
  { id: 'storyteller', icon: Feather, labelKey: 'badgeStoryteller', unlockKey: 'storytellerUnlock' },
  {
    id: 'workspaceBuilder',
    icon: Building2,
    labelKey: 'badgeWorkspaceBuilder',
    unlockKey: 'workspaceBuilderUnlock',
  },
  { id: 'nightOwl', icon: Moon, labelKey: 'badgeNightOwl', unlockKey: 'nightOwlUnlock' },
  { id: 'marathoner', icon: Flame, labelKey: 'badgeMarathoner', unlockKey: 'marathonerUnlock' },
  { id: 'collaborator', icon: Users2, labelKey: 'badgeCollaborator', unlockKey: 'collaboratorUnlock' },
  { id: 'weaver', icon: GitFork, labelKey: 'badgeWeaver', unlockKey: 'weaverUnlock' },
  { id: 'sage', icon: Brain, labelKey: 'badgeSage', unlockKey: 'sageUnlock' },
];

export const DEFAULT_BADGES: readonly TBadgeId[] = ['founder'];
