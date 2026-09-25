export type TTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface ITooltipPosition {
  top: number;
  left: number;
  placement: TTooltipPlacement;
  arrowLeft: number;
  arrowTop: number;
}
