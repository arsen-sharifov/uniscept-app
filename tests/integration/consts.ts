export const INTEGRATION_ACCOUNT_DOMAIN = 'integration.uniscept.test';

export const INTEGRATION_ACCOUNT_PASSWORD = 'integration-password';

export const ACCOUNT_PAGE_SIZE = 1000;

export const CUSTOM_ROLE_POSITION = 3;

export const NAME_LENGTH_CAP = 200;

export const ROLE_NAME_LENGTH_CAP = 60;

export const TEXT_LENGTH_CAP = 5000;

export const ICON_LENGTH_CAP = 64;

export const EMAIL_LENGTH_CAP = 320;

export const PENDING_INVITATION_CAP = 100;

export const CONCURRENT_INVITATIONS = 5;

export const COMPLETED_GUIDES_CAP = 32;

export const COMPLETED_GUIDES_LENGTH_CAP = 2048;

export const DAY_MS = 24 * 60 * 60 * 1000;

export const ALLOWANCE_TTL_MS = 10 * 60 * 1000;

export const BACKDATED_TIMESTAMP = '2000-01-01T00:00:00Z';

export const MISSING_ROW_ID = '00000000-0000-4000-8000-000000000000';

export const CLIENT_OPTIONS = { auth: { autoRefreshToken: false, persistSession: false } };

export const RICH_TEXT_SIZE_CAP = 100_000;

export const RICH_LABEL_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Ship ' },
        { type: 'text', text: 'now', marks: [{ type: 'bold' }] },
      ],
    },
  ],
};

export const RESTYLED_LABEL_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Ship ' },
        { type: 'text', text: 'now', marks: [{ type: 'italic' }] },
      ],
    },
  ],
};

export const RICH_LABEL_TEXT = 'Ship now';

export const OVERSIZED_RICH_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x'.repeat(RICH_TEXT_SIZE_CAP) }] }],
};

export const NOT_A_DOCUMENT = { type: 'paragraph', content: [] };
