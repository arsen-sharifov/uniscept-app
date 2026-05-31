import { useMemo } from 'react';

import type { IToolGroup } from '@interfaces';
import { useTranslations } from '@hooks';
import { type IToolbarProps, Toolbar, buildCanvasToolGroups } from '@/components';

type TTranslations = ReturnType<typeof useTranslations>;

export interface IToolbarWithStateProps extends IToolbarProps {
  buildGroups?: (t: TTranslations) => IToolGroup[];
  mapGroups?: (groups: IToolGroup[]) => IToolGroup[];
}

export const ToolbarWithState = ({ buildGroups, mapGroups, ...args }: IToolbarWithStateProps) => {
  const t = useTranslations();

  const groups = useMemo(() => {
    if (buildGroups) return buildGroups(t);
    const base = args.groups ?? buildCanvasToolGroups(t.platform.canvas.tools);

    return mapGroups ? mapGroups(base) : base;
  }, [args.groups, buildGroups, mapGroups, t]);

  return <Toolbar {...args} groups={groups} />;
};
