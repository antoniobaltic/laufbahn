import { COLUMN_CONFIG, type ApplicationStatus } from "@/lib/utils/constants";
import type { ApplicationDocumentType } from "@/types/application-detail";

export function formatSalaryRange(min: number | null, max: number | null): string {
  const fmt = (value: number) =>
    (value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`) + "\u00A0\u20AC";

  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `ab ${fmt(min)}`;
  if (max) return `bis ${fmt(max)}`;
  return "";
}

export function getStatusLabel(status: ApplicationStatus): string {
  return COLUMN_CONFIG[status].title;
}

export function getStatusColors(status: ApplicationStatus) {
  const config = COLUMN_CONFIG[status];
  return {
    backgroundColor: config.bgLight,
    color: config.color,
  };
}

export function getDocumentTypeLabel(type: ApplicationDocumentType): string {
  const labels: Record<ApplicationDocumentType, string> = {
    lebenslauf: "Lebenslauf",
    anschreiben: "Anschreiben",
    portfolio: "Portfolio",
    arbeitsprobe: "Arbeitsprobe",
    zeugnis: "Zeugnis",
    sonstiges: "Sonstiges",
  };

  return labels[type];
}
