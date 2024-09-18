import { format, subHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const isValidDate = (timestamp: string) => {
  const d = new Date(timestamp);

  return d instanceof Date && !Number.isNaN(d);
};

export const formatTimeSinceReturnValue = (value: number, suffix: string) => {
  if (value > 1) return value + ' ' + suffix + 's ago';
  return value + ' ' + suffix + ' ago';
};

// The algorithm to find timeSince comes from this SO answer:
// https://stackoverflow.com/a/3177838/7088648
export const timeSince = (dateString: string, curDate = new Date()) => {
  const date = new Date(dateString);

  const seconds = Math.floor((curDate.valueOf() - date.valueOf()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return formatTimeSinceReturnValue(Math.floor(interval), 'year');
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return formatTimeSinceReturnValue(Math.floor(interval), 'month');
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return formatTimeSinceReturnValue(Math.floor(interval), 'day');
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return formatTimeSinceReturnValue(Math.floor(interval), 'hour');
  }
  interval = seconds / 60;
  if (interval > 1) {
    return formatTimeSinceReturnValue(Math.floor(interval), 'minute');
  }
  return formatTimeSinceReturnValue(Math.floor(interval), 'second');
};

export function formatTimestamp(
  timestamp: string,
  timeZone?: {
    value: string;
    offset: number;
  }
) {
  try {
    const date = new Date(timestamp);
    if (timeZone) {
      // Adjust the date to the user's timezone. The original timezone is in GMT +0
      const timezoneOffset = timeZone.offset;
      date.setMinutes(date.getMinutes() - timezoneOffset);
    }
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: timeZone?.value || undefined,
    });

    return formatter.format(date);
  } catch {
    return timestamp;
  }
}

export function formatTimestampInLocalTimezone(timestamp: string) {
  return formatTimestamp(timestamp, {
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date(timestamp).getTimezoneOffset(),
  });
}

export function nsToMs(ns: string) {
  const nsNumber = Number(ns);
  return (nsNumber / 1000000).toFixed(2);
}

export function getCurrentTimeMinusOneHour(): string {
  const adjustedDate = subHours(new Date(), 1);
  return format(adjustedDate, 'yyyy-MM-dd HH:mm:ss');
}

// Returns time in UTC instead of local time
export function getCurrentUTCTimeMinusOneHour(): string {
  const now = new Date();
  const lastHour = subHours(now, 1);
  const utcDate = utcToZonedTime(lastHour, 'UTC');
  return format(utcDate, 'yyyy-MM-dd HH:mm:ss');
}

export function getCurrentTime(): string {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

export function getCurrentUTCTime(): string {
  const date = new Date();
  const utcDate = utcToZonedTime(date, 'UTC');
  return format(utcDate, 'yyyy-MM-dd HH:mm:ss');
}

export function getStartOfToday(): string {
  return format(new Date(), 'yyyy-MM-dd 00:00:00');
}

export function getEndOfToday(): string {
  return format(new Date(), 'yyyy-MM-dd 23:59:59');
}

// return date in yyyy-mmm-dd format
export const getCurrentDate = () => {
  // Get the current date and time
  const currentDate = new Date();

  // Extract date components
  const year = currentDate.getUTCFullYear();
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(currentDate.getUTCDate()).padStart(2, '0');

  const date = `${year}-${month}-${day}`;

  return date;
};
