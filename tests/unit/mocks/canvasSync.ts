import { MAX_RETRIES, RETRY_BASE_MS } from '@/lib/canvas';

export const TOTAL_RETRY_BACKOFF_MS = RETRY_BASE_MS * (2 ** MAX_RETRIES - 1);
