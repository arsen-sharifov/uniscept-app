'use client';

import type { IResolvedCanvasAuthor } from '@interfaces';

import { useTranslations } from '@/i18n';
import { useCanvasStore } from '@/lib/stores';

export const useCanvasAuthor = (authorId?: string): IResolvedCanvasAuthor => {
  const t = useTranslations();
  const author = useCanvasStore((state) => (authorId ? state.authors[authorId] : undefined));

  if (author) return { ...author, kind: 'member' };
  if (authorId) return { name: t.platform.canvas.authorship.formerMember, avatarIcon: null, kind: 'former' };

  return { name: t.platform.canvas.authorship.deletedAccount, avatarIcon: null, kind: 'deleted' };
};
