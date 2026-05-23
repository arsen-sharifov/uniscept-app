import { clsx } from 'clsx';

import type { ITypeRow } from '@story-interfaces';

import { FAMILY_BADGE } from '../../consts';

interface IFamilyChipProps {
  family: ITypeRow['family'];
}

export const FamilyChip = ({ family }: IFamilyChipProps) => (
  <span
    className={clsx(
      'inline-flex rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.18em] uppercase ring-1',
      FAMILY_BADGE[family],
    )}
  >
    {family}
  </span>
);
