import {
  differenceInCalendarDays,
  formatDistanceToNow,
  isValid,
  parseISO,
} from "date-fns";
import { de } from "date-fns/locale";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_INPUT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const DACH_TIME_ZONE = "Europe/Vienna";
const relativeDayFormatter = new Intl.RelativeTimeFormat("de", {
  numeric: "auto",
});
const dateFormatter = new Intl.DateTimeFormat("de-AT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: DACH_TIME_ZONE,
});
const dateTimeFormatter = new Intl.DateTimeFormat("de-AT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: DACH_TIME_ZONE,
});
const inputDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: DACH_TIME_ZONE,
});
const inputDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: DACH_TIME_ZONE,
});
const offsetFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: DACH_TIME_ZONE,
});

export function isDateOnlyValue(date: string | Date): date is string {
  return typeof date === "string" && DATE_ONLY_PATTERN.test(date);
}

function mapParts(
  formatter: Intl.DateTimeFormat,
  date: Date
): Record<string, string> {
  return formatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }

      return acc;
    },
    {}
  );
}

function parseDateOnlyParts(date: string) {
  const [year, month, day] = date.split("-");

  return { year, month, day };
}

function pad2(value: string | number) {
  return String(value).padStart(2, "0");
}

function getZonedDateParts(date: string | Date) {
  if (isDateOnlyValue(date)) {
    const parts = parseDateOnlyParts(date);

    return {
      year: parts.year,
      month: parts.month,
      day: parts.day,
    };
  }

  return mapParts(inputDateFormatter, parseStoredDate(date));
}

function getZonedDateTimeParts(date: string | Date) {
  const parts = mapParts(inputDateTimeFormatter, parseStoredDate(date));

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
  };
}

function getTimeZoneOffsetMs(date: Date) {
  const parts = mapParts(offsetFormatter, date);

  const utcTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return utcTimestamp - date.getTime();
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
  if (isDateOnlyValue(date)) {
    const parts = parseDateOnlyParts(date);
    const monthLabel = mapParts(
      dateFormatter,
      new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)))
    ).month;

    return `${Number(parts.day)}. ${monthLabel} ${parts.year}`;
  }

  const parts = mapParts(dateFormatter, parseStoredDate(date));
  return `${Number(parts.day)}. ${parts.month} ${parts.year}`;
}

export function formatDateShort(date: string | Date): string {
  const parts = getZonedDateParts(date);
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year}`;
}

export function formatDateTime(date: string | Date): string {
  const parts = mapParts(dateTimeFormatter, parseStoredDate(date));
  return `${Number(parts.day)}. ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}`;
}

export function formatDateInputValue(date: string | Date): string {
  if (isDateOnlyValue(date)) {
    return date;
  }

  const parts = getZonedDateParts(date);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function formatDateTimeInputValue(date: string | Date): string {
  const parts = getZonedDateTimeParts(date);

  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

export function dateTimeInputToISOString(value: string): string {
  const trimmed = value.trim();
  const match = DATE_TIME_INPUT_PATTERN.exec(trimmed);

  if (!match) {
    throw new Error("Ungueltiges Datumsformat.");
  }

  const [, year, month, day, hour, minute] = match;
  const baseTimestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  const offset = getTimeZoneOffsetMs(new Date(baseTimestamp));
  let zonedDate = new Date(baseTimestamp - offset);
  const adjustedOffset = getTimeZoneOffsetMs(zonedDate);

  if (adjustedOffset !== offset) {
    zonedDate = new Date(baseTimestamp - adjustedOffset);
  }

  return zonedDate.toISOString();
}
