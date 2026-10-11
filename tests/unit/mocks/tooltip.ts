import { createElement } from 'react';

import { domRect } from './browser';

export const NonForwardingTrigger = () => createElement('button', { type: 'button' }, 'Invite code');

export const TOOLTIP_HELP_TEXT = 'Required during closed beta.';

export const SMART_TOOLTIP_DELAY_MS = 350;

export const TOOLTIP_TRIGGER_RECT = domRect({ top: 300, bottom: 320, left: 400, right: 500, width: 100, height: 20 });
