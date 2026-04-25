export type TTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface ITooltipSize {
  width: number;
  height: number;
}

export interface ITooltipPosition {
  top: number;
  left: number;
  placement: TTooltipPlacement;
  arrowLeft: number;
  arrowTop: number;
}
