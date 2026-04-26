import { interpolate } from '@/lib/utils';

interface IRelativeTimeTranslations {
  justNow: string;
  secondsAgo: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
}

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86_400;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const JUST_NOW_THRESHOLD_SECONDS = 5;

export const formatRelativeTime = (timestamp: number, now: number, t: IRelativeTimeTranslations): string => {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (seconds < JUST_NOW_THRESHOLD_SECONDS) return t.justNow;
  if (seconds < SECONDS_IN_MINUTE) {
    return interpolate(t.secondsAgo, { n: seconds });
  }

  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  if (minutes < MINUTES_IN_HOUR) {
    return interpolate(t.minutesAgo, { n: minutes });
  }

  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  if (hours < HOURS_IN_DAY) {
    return interpolate(t.hoursAgo, { n: hours });
  }

  const days = Math.floor(seconds / SECONDS_IN_DAY);
  if (days < DAYS_IN_WEEK) {
    return interpolate(t.daysAgo, { n: days });
  }

  return new Date(timestamp).toLocaleDateString();
};
