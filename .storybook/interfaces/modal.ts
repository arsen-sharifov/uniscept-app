export type TModalTabId = 'overview' | 'members' | 'billing';

export interface IModalTab {
  id: TModalTabId;
  label: string;
  body: string;
}
