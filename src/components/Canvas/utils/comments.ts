import type { IComment } from '@interfaces';

export const isOwnComment = (comment: IComment, userId: string | null): boolean => comment.authorId === userId;
