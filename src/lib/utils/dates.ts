import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
} from "date-fns";
import { de } from "date-fns/locale";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const relativeDayFormatter = new Intl.RelativeTimeFormat("de", {
  numeric: "auto",
});

export function isDateOnlyValue(date: string | Date): boolean {
  return typeof date === "string" && DATE_ONLY_PATTERN.test(date);
}

export function parseStoredDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }

  const parsed = parseISO(date);

  if (isValid(parsed)) {
    return parsed;
  }

  return new Date(date);
}

export function toTimestamp(date: string | Date): number {
  return parseStoredDate(date).getTime();
}

export function getCalendarDayDifference(
  date: string | Date,
  now = new Date()
): number {
  return differenceInCalendarDays(parseStoredDate(date), now);
}

export function relativeDate(date: string | Date): string {
  if (isDateOnlyValue(date)) {
    return relativeDayFormatter.format(getCalendarDayDifference(date), "day");
  }

  return formatDistanceToNow(parseStoredDate(date), {
    addSuffix: true,
    locale: de,
  });
}

export function formatDate(date: string | Date): string {
  return format(parseStoredDate(date), "d. MMM yyyy", { locale: de });
}

export function formatDateShort(date: string | Date): string {
  return format(parseStoredDate(date), "dd.MM.yyyy", { locale: de });
}

export function formatDateTime(date: string | Date): string {
  return format(parseStoredDate(date), "d. MMM yyyy, HH:mm", { locale: de });
}

export function formatDateInputValue(date: string | Date): string {
  return format(parseStoredDate(date), "yyyy-MM-dd");
}

export function formatDateTimeInputValue(date: string | Date): string {
  return format(parseStoredDate(date), "yyyy-MM-dd'T'HH:mm");
}
