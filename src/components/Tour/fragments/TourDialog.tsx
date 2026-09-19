import type { ReactNode } from 'react';

import { Modal } from '@/components/Modal';

interface ITourDialogProps {
  open: boolean;
  onClose: () => void;
  width: string;
  children: ReactNode;
}

export const TourDialog = ({ open, onClose, width, children }: ITourDialogProps) => (
  <Modal open={open} onClose={onClose} width={width} layerClassName="z-80">
    <div data-tour-panel className="p-6">
      {children}
    </div>
  </Modal>
);
