import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import pt from '@/locales/pt.json';
import ro from '@/locales/ro.json';
import uk from '@/locales/uk.json';

import type { IE2ENodeSeed, IE2EScreenSize, IE2ETranslation } from './interfaces';

export const COPY = en;

export const COPY_UK = uk;

export const EXAMPLE_SCENES: readonly (keyof typeof en.platform.onboarding.steps)[] = [
  'exampleIntro',
  'exampleHello',
  'exampleThread',
  'exampleCapsule',
  'exampleBean',
  'exampleDoubt',
  'examplePayback',
  'exampleFilter',
  'exampleStale',
  'exampleDropFilter',
  'exampleWaste',
  'exampleDropCapsule',
  'exampleValid',
  'exampleAnswer',
  'exampleResolved',
  'exampleWrap',
];

export const E2E_AUTH_STATE_DIR = 'artifacts/e2e/auth';

export const E2E_ACCOUNT_DOMAIN = 'e2e.uniscept.test';

export const E2E_ACCOUNT_PASSWORD = 'Uniscept-E2E-1!';

export const E2E_ACCOUNT_PLAN = 'beta';

export const E2E_MAILPIT_URL = 'http://127.0.0.1:54324';

export const CANVAS_NODE_TYPE = 'canvas-node';

export const QUESTION_NODE_TYPE = 'question-node';

export const REFERENCE_NODE_TYPE = 'reference-node';

export const QUESTION_POSITION = { x: 460, y: 110 };

export const PREFERENCES_ENDPOINT = '/rest/v1/user_preferences';

export const ONBOARDING_ENDPOINT = '/rest/v1/user_onboarding';

export const NODE_SELECTOR = '.react-flow__node';

export const EDGE_SELECTOR = '.react-flow__edge';

export const PANE_SELECTOR = '.react-flow__pane';

export const VIEWPORT_SELECTOR = '.react-flow__viewport';

export const LANDING_WORLD_SELECTOR = '.landing-world';

export const TOUR_CARD_SELECTOR = '[data-tour-card]';

export const SAVE_STATE_SELECTOR = '[data-canvas-save]';

export const SAVE_STATE_ATTRIBUTE = 'data-canvas-save';

export const SAVE_STATE_SAVED = 'saved';

export const CONTEXT_MENU_TIMEOUT_MS = 2_000;

export const CONTEXT_MENU_ATTEMPTS = 3;

export const LABEL_EDITOR_TIMEOUT_MS = 2_000;

export const LABEL_EDITOR_ATTEMPTS = 3;

export const EXPORT_TIMEOUT_MS = 30_000;

export const EXPORT_THREAD_NAME = 'Export thread';

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

export const REJECTED_EMAIL = `rejected@${E2E_ACCOUNT_DOMAIN}`;

export const NEW_PASSWORD = 'Uniscept-E2E-2!';

export const RESET_EMAIL_SUBJECT = 'Reset your Uniscept password';

export const RESET_EMAIL_SUBJECT_UK = 'Відновлення пароля Uniscept';

export const ONBOARDING_QUESTION = 'Do we ship on Friday?';

export const ONBOARDING_CLAIM = 'The release checklist is green';

export const DEFAULT_WORKSPACE_NAME = 'New Workspace';

export const SHARED_WORKSPACE_NAME = 'Invitation source';

export const CUSTOM_ROLE_NAME = 'Reviewer';

export const SHORT_WINDOW = { width: 683, height: 320 };

export const LAPTOP_WINDOW = { width: 1366, height: 640 };

export const NARROWED_WINDOW = { width: 1024, height: 520 };

export const SMALL_LAPTOP_WINDOW = { width: 1024, height: 640 };

export const SHORT_LAPTOP_WINDOW = { width: 1024, height: 480 };

export const SCREEN_SIZES: readonly IE2EScreenSize[] = [
  { name: 'a narrow window', viewport: { width: 640, height: 360 } },
  { name: 'a laptop zoomed to 200%', viewport: SHORT_WINDOW },
  { name: 'a small laptop', viewport: SMALL_LAPTOP_WINDOW },
  { name: 'a laptop', viewport: LAPTOP_WINDOW },
  { name: 'an ultrawide monitor', viewport: { width: 3440, height: 1300 } },
];

export const SCREEN_SIZE_QUESTION = 'Should the team move to a four-day week?';

export const CENTER_TOLERANCE_PX = 1;

export const READABLE_CANVAS_ZOOM = 0.4;

export const OVERLAY_PROBE_INSET_PX = 6;

export const RAIL_EDGE_GAP_PX = 12;

export const OVERLAY_TOP_PX = 160;

export const LONG_THREAD_LIST: readonly string[] = Array.from({ length: 12 }, (_, index) => `Thread ${index + 1}`);

export const TRANSLATIONS: readonly IE2ETranslation[] = [
  { name: 'English', locale: 'en-US', copy: en },
  { name: 'Ukrainian', locale: 'uk-UA', copy: uk },
  { name: 'Romanian', locale: 'ro-RO', copy: ro },
  { name: 'French', locale: 'fr-FR', copy: fr },
  { name: 'Spanish', locale: 'es-ES', copy: es },
  { name: 'Portuguese', locale: 'pt-PT', copy: pt },
];

export const SETTINGS_SECTION_KEYS: readonly (keyof typeof en.platform.settings.sections)[] = [
  'profile',
  'security',
  'notifications',
  'appearance',
  'editor',
  'plan',
];

export const VALID_CLAIM: IE2ENodeSeed = {
  label: 'Fewer meetings leave more focus time',
  x: 420,
  y: 320,
  status: 'valid',
};

export const OPEN_CLAIM: IE2ENodeSeed = { label: 'Customer support needs cover on all five days', x: 760, y: 320 };
