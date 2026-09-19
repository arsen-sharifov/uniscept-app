import type { Edge, Node } from '@xyflow/react';

import type { ECanvasTool } from '@/components/tools';

import type { TNodeStatus } from './canvas';
import type { TMascotCharacter, TMascotPose } from './components/mascot';
import type { TNavItem } from './components/sidebar';
import type { TTranslations } from './i18n';
import type { IWorkspaceRolePermissions } from './workspace';

export type TGuideId = 'base' | 'canvas' | 'workspace' | 'settings' | 'example';

export type TTourAnchor =
  | 'sidebarCreateThread'
  | 'sidebarCreateFolder'
  | 'sidebarTree'
  | 'sidebarThreadResolved'
  | 'sidebarWorkspaceSwitcher'
  | 'sidebarNewWorkspace'
  | 'sidebarWorkspaceCreate'
  | 'sidebarWorkspaceRow'
  | 'sidebarWorkspaceRowSettings'
  | 'sidebarNewThreadCta'
  | 'sidebarWorkspacePanel'
  | 'sidebarUserMenu'
  | 'userMenuSettings'
  | 'canvas'
  | 'canvasQuestionNode'
  | 'canvasNode'
  | 'canvasNodeComments'
  | 'canvasNodeUnmarked'
  | 'canvasNodeValid'
  | 'canvasNodeLoose'
  | 'canvasCommentsPanel'
  | 'canvasReferenceSearch'
  | 'toolbar'
  | 'toolbarSelect'
  | 'toolbarPan'
  | 'toolbarZoomIn'
  | 'toolbarUndo'
  | 'toolbarAddNode'
  | 'toolbarConnect'
  | 'toolbarDelete'
  | 'toolbarValidPath'
  | 'toolbarInvalidPath'
  | 'toolbarAnswer'
  | 'toolbarCrossReference'
  | 'toolbarExport'
  | 'toolbarHelp'
  | 'helpMenuShortcuts'
  | 'exportMenu'
  | 'shortcutsSheet'
  | 'shortcutsClose'
  | 'settingsModal'
  | 'settingsNav'
  | 'settingsAppearanceNav'
  | 'settingsEditorNav'
  | 'settingsAppearance'
  | 'settingsEditor'
  | 'workspaceSettingsModal'
  | 'workspaceSettingsNav'
  | 'workspaceSettingsMembersNav'
  | 'workspaceSettingsMembers'
  | 'settingsProfileNav'
  | 'settingsSecurityNav'
  | 'settingsNotificationsNav'
  | 'settingsPlanNav'
  | 'settingsProfile'
  | 'settingsSecurity'
  | 'settingsNotifications'
  | 'settingsPlan'
  | 'workspaceSettingsGeneralNav'
  | 'workspaceSettingsRolesNav'
  | 'workspaceSettingsGeneral'
  | 'workspaceSettingsRoles'
  | 'sidebarSearch';

export type TTourSignal =
  'canvasExported' | 'nodeLabelled' | 'themePicked' | 'patternPicked' | 'editorTuned' | 'profileSaved';

export type TTourPlacement = 'left' | 'right' | 'top' | 'bottom' | 'center';

export type TTourButtonVariant = 'primary' | 'secondary';

export type TTourButtonSize = 'sm' | 'md';

export type TGuideStatus = 'done' | 'locked' | 'ready';

export type TTourHint = 'afterTour' | 'afterDecline';

export interface ITourSpeaker {
  name: 'nodiName' | 'ergoName';
  alt: 'nodiAlt' | 'ergoAlt';
  tone: string;
}

export type TExampleOptionKey = 'capsule' | 'bean' | 'filter';

export type TExampleNodeKey = TExampleOptionKey | 'oneButton' | 'perCup' | 'payback' | 'cheapest';

export type TExampleTarget = TExampleNodeKey | 'question';

export interface IExampleNodeLayout {
  parent: TExampleTarget;
  x: number;
  y: number;
}

export interface IExampleThreadAct {
  type: 'thread';
}

export interface IExampleArgueAct {
  type: 'argue';
  keys: readonly TExampleNodeKey[];
}

export interface IExampleCommentAct {
  type: 'comment';
  key: TExampleOptionKey;
}

export interface IExampleStatusAct {
  type: 'status';
  status: Exclude<TNodeStatus, null>;
  keys: readonly TExampleNodeKey[];
}

export interface IExampleAnswerAct {
  type: 'answer';
  key: TExampleOptionKey;
}

export type TExampleAct =
  IExampleThreadAct | IExampleArgueAct | IExampleCommentAct | IExampleStatusAct | IExampleAnswerAct;

export type TExampleCanvasAct = Exclude<TExampleAct, IExampleThreadAct>;

export interface IExampleCopy {
  question: string;
  placeholder: string;
  nodes: Record<TExampleNodeKey, string>;
  comments: Record<TExampleOptionKey, string>;
}

export interface ITourPermissions extends Omit<IWorkspaceRolePermissions, 'canManageWorkspace'> {
  resolved: boolean;
}

export interface ITourSnapshot {
  nodes: Node[];
  edges: Edge[];
  activeTool: ECanvasTool;
  threadId: string | null;
  openCommentsNodeId: string | null;
  pendingConnection: string | null;
  workspaceCount: number;
  folderCount: number;
  nestedThreadCount: number;
  referenceTargetCount: number;
  permissions: ITourPermissions;
  visibleAnchors: ReadonlySet<TTourAnchor>;
  signals: ReadonlySet<TTourSignal>;
}

export type TTourPredicate = (snapshot: ITourSnapshot) => boolean;

export type TTourStepKey = keyof TTranslations['platform']['onboarding']['steps'];

export type TGuideHintKey = keyof TTranslations['platform']['onboarding']['hints'];

export type TTourAnchorResolver = (snapshot: ITourSnapshot) => readonly TTourAnchor[];

export interface ITourStep {
  copyKey: TTourStepKey;
  anchors?: TTourAnchorResolver;
  openAnchors?: readonly TTourAnchor[];
  placement: TTourPlacement;
  pose: TMascotPose;
  speaker?: TMascotCharacter;
  act?: TExampleAct;
  isDone?: TTourPredicate;
  isSkipped?: TTourPredicate;
}

export interface IGuideRequirement {
  hintKey: TGuideHintKey;
  isMet: TTourPredicate;
}

export interface IGuideDefinition {
  id: TGuideId;
  steps: readonly ITourStep[];
  requires: readonly IGuideRequirement[];
}

export interface IOnboardingProgress {
  offerAnswered: boolean;
  completedGuides: readonly TGuideId[];
}

export interface IOnboardingRow {
  offer_answered: boolean;
  completed_guides: string[];
}

export interface ITourRun {
  guideId: TGuideId;
  stepIndex: number;
}

export interface IAnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ITourGeometry {
  rect: IAnchorRect | null;
  anchor: TTourAnchor | null;
  blocked: IAnchorRect | null;
  lit: readonly IAnchorRect[];
  open: readonly IAnchorRect[];
}

export interface ITrackedGeometry extends ITourGeometry {
  lastRect: IAnchorRect | null;
  lost: boolean;
}

export interface ITourGeometryState extends ITrackedGeometry {
  key: string;
}

export interface IResolvedAnchor {
  anchor: TTourAnchor;
  element: HTMLElement;
}

export interface ITourCardPosition {
  top: number;
  left: number;
}

export interface IStepArrival {
  index: number;
  done: boolean;
}

export interface ITourSnapshotInput {
  items: readonly TNavItem[];
  workspaceId: string | null;
  workspaceCount: number;
  threadId: string | null;
  active: boolean;
}
