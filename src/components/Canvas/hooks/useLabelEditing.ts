'use client';

import type { IRichTextValue, IUseLabelEditingOptions, IUseLabelEditingResult } from '@interfaces';

import { useOnboardingStore } from '@/lib/onboarding';
import { isSameRichText } from '@/lib/richText';
import { useCanvasStore } from '@/lib/stores';

export const useLabelEditing = ({
  id,
  label,
  richLabel,
  signalLabelled = false,
}: IUseLabelEditingOptions): IUseLabelEditingResult => {
  const setEditingNodeId = useCanvasStore((state) => state.setEditingNodeId);
  const updateNodeLabel = useCanvasStore((state) => state.updateNodeLabel);

  const commitLabel = ({ text, document }: IRichTextValue) => {
    setEditingNodeId(null);
    if (!text || (text === label && isSameRichText(document, richLabel))) return;

    updateNodeLabel(id, text, document);
    if (signalLabelled) useOnboardingStore.getState().markSignal('nodeLabelled');
  };

  return { commitLabel, cancelEditing: () => setEditingNodeId(null) };
};
