export interface IUseMenuKeyboardNavigationOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IUseViewportChangeOptions {
  onScroll?: () => void;
  onResize?: () => void;
  enabled?: boolean;
  capture?: boolean;
}
