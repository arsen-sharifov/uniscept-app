import type { IE2EMailboxSearch, IE2EMailMessage } from '../interfaces';

const MAILPIT_URL = 'http://127.0.0.1:54324';

const POLL_ATTEMPTS = 20;

const POLL_INTERVAL_MS = 500;

const VERIFY_LINK_PATTERN = /https?:\/\/\S+\/auth\/v1\/verify\S+/;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const readJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${MAILPIT_URL}${path}`);

  if (!response.ok) throw new Error(`Mailpit request ${path} failed with ${response.status}`);

  return (await response.json()) as T;
};

const findNewestMessageId = async (email: string): Promise<string | null> => {
  const query = encodeURIComponent(`to:${email}`);
  const mailbox = await readJson<IE2EMailboxSearch>(`/api/v1/search?query=${query}`);

  return mailbox.messages[0]?.ID ?? null;
};

export const readConfirmationLink = async (email: string, attempt = 0): Promise<string> => {
  const messageId = await findNewestMessageId(email);

  if (!messageId) {
    if (attempt >= POLL_ATTEMPTS) throw new Error(`No confirmation email arrived for ${email}`);

    await wait(POLL_INTERVAL_MS);

    return readConfirmationLink(email, attempt + 1);
  }

  const message = await readJson<IE2EMailMessage>(`/api/v1/message/${messageId}`);
  const link = message.Text.match(VERIFY_LINK_PATTERN)?.[0];

  if (!link) throw new Error(`The email to ${email} carries no confirmation link`);

  return link;
};
