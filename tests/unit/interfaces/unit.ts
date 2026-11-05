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

export interface IUnitToolHookInput {
  tool_name: string;
  tool_input: object;
  cwd?: string;
  agent_type?: string;
}

export interface IUnitPromptHookInput {
  hook_event_name: 'UserPromptSubmit';
  prompt: string;
}

export interface IUnitGuardDecision {
  name: string;
  input: IUnitToolHookInput | IUnitPromptHookInput;
  expected: { decision: 'deny' | 'ask' | 'allow'; codex?: 'asks' | 'blocks' };
}
