export interface IUnitExportSceneNode {
  id: string;
  x: number;
  y: number;
  label: string;
  richLabel?: string;
  editor?: string;
  card?: boolean;
}

export interface IUnitExportSceneEdge {
  id: string;
  source: string;
  target: string;
  sided: boolean;
  bidirectional: boolean;
}

export interface IUnitExportScene {
  nodes: IUnitExportSceneNode[];
  edges: IUnitExportSceneEdge[];
}
