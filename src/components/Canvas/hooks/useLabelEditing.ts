'use client';

import type { IRichTextValue, IUseLabelEditingOptions, IUseLabelEditingResult } from '@interfaces';

import { useOnboardingStore } from '@/lib/onboarding';
import { isSameRichTextValue } from '@/lib/richText';
import { useCanvasStore } from '@/lib/stores';

export const useLabelEditing = ({
  id,
  label,
  richLabel,
  signalLabelled = false,
}: IUseLabelEditingOptions): IUseLabelEditingResult => {
  const setEditingNodeId = useCanvasStore((state) => state.setEditingNodeId);
  const updateNodeLabel = useCanvasStore((state) => state.updateNodeLabel);

  const commitLabel = (value: IRichTextValue) => {
    setEditingNodeId(null);
    if (!value.text || isSameRichTextValue(value, label, richLabel)) return;

    updateNodeLabel(id, value.text, value.document);
    if (signalLabelled) useOnboardingStore.getState().markSignal('nodeLabelled');
  };

  return { commitLabel, cancelEditing: () => setEditingNodeId(null) };
};
