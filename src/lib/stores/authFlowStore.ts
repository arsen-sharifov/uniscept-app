'use client';

import { create } from 'zustand';

import type { IPasswordResetRequest } from '@interfaces';

interface IAuthFlowState {
  draftEmail: string;
  resetRequest: IPasswordResetRequest | null;
}

interface IAuthFlowStore extends IAuthFlowState {
  setDraftEmail: (email: string) => void;
  clearDraftEmail: () => void;
  rememberResetRequest: (request: IPasswordResetRequest) => void;
  reset: () => void;
}

const INITIAL_STATE: IAuthFlowState = {
  draftEmail: '',
  resetRequest: null,
};

export const useAuthFlowStore = create<IAuthFlowStore>((set) => ({
  ...INITIAL_STATE,

  setDraftEmail: (draftEmail) => set({ draftEmail }),
  clearDraftEmail: () => set({ draftEmail: '' }),
  rememberResetRequest: (resetRequest) => set({ resetRequest }),
  reset: () => set(INITIAL_STATE),
}));
