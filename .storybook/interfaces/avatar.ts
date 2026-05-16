export interface IInitialsCase {
  label: string;
  name: string;
  description: string;
}

export interface IMemberRow {
  name: string;
  role: string;
  tone: 'owner' | 'editor' | 'viewer';
}
