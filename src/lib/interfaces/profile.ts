export type TGlyphId =
  | 'cat'
  | 'dog'
  | 'panda'
  | 'rabbit'
  | 'squirrel'
  | 'turtle'
  | 'snail'
  | 'bird'
  | 'fish'
  | 'bug'
  | 'flower'
  | 'rose'
  | 'clover'
  | 'leaf'
  | 'sprout'
  | 'treePine'
  | 'cherry'
  | 'grape'
  | 'carrot'
  | 'citrus';

export type TGlyphLabelKey = `glyph${Capitalize<TGlyphId>}`;

export type TBadgeId =
  | 'founder'
  | 'firstSteps'
  | 'architect'
  | 'connector'
  | 'critic'
  | 'linguist'
  | 'curator'
  | 'voice'
  | 'explorer'
  | 'storyteller'
  | 'workspaceBuilder'
  | 'nightOwl'
  | 'marathoner'
  | 'collaborator'
  | 'weaver'
  | 'sage';

export type TBadgeLabelKey = `badge${Capitalize<TBadgeId>}`;

export type TBadgeUnlockKey = `${TBadgeId}Unlock`;

export interface IUserProfileUpdate {
  name?: string;
  glyph?: TGlyphId | null;
}

export interface IUserMetadata {
  name?: string;
  glyph?: string;
  badges?: string[];
  plan?: string;
}
