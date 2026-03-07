export const COLUMN_ORDER = [
  "gemerkt",
  "beworben",
  "im_gespraech",
  "angebot",
  "abgelehnt",
  "ghosted",
] as const;

export type ApplicationStatus = (typeof COLUMN_ORDER)[number];

export const COLUMN_CONFIG: Record<
  ApplicationStatus,
  { title: string; color: string; bgLight: string }
> = {
  gemerkt: {
    title: "Gemerkt",
    color: "var(--color-status-gemerkt)",
    bgLight: "var(--color-blue-50)",
  },
  beworben: {
    title: "Beworben",
    color: "var(--color-status-beworben)",
    bgLight: "var(--color-orange-50)",
  },
  im_gespraech: {
    title: "Im Gespräch",
    color: "var(--color-status-gespraech)",
    bgLight: "#faf6e8",
  },
  angebot: {
    title: "Angebot",
    color: "var(--color-status-angebot)",
    bgLight: "var(--color-green-50)",
  },
  abgelehnt: {
    title: "Abgelehnt",
    color: "var(--color-status-abgelehnt)",
    bgLight: "#fef2ef",
  },
  ghosted: {
    title: "Ghosted",
    color: "var(--color-status-ghosted)",
    bgLight: "var(--color-dark-50)",
  },
};

export const FREE_TIER_LIMIT = 10;
