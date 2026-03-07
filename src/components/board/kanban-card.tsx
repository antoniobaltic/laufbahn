"use client";

import Link from "next/link";
import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  MapPin,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/company/company-logo";
import { formatSalaryRange } from "@/lib/utils/applications";
import { getCalendarDayDifference } from "@/lib/utils/dates";
import { extractDomain } from "@/lib/utils/url";
import type { ApplicationOverview } from "@/types/application";
import { relativeDate, formatDateShort } from "@/lib/utils/dates";

interface KanbanCardProps {
  application: ApplicationOverview;
  index: number;
  onDelete?: (id: string) => void;
}

export function KanbanCard({ application, index, onDelete }: KanbanCardProps) {
  const [referenceNow] = useState(() => new Date());
  const hasDeadline = application.deadline !== null;
  const deadlineDiffDays = hasDeadline
    ? getCalendarDayDifference(application.deadline!, referenceNow)
    : null;
  const isDeadlineSoon =
    deadlineDiffDays !== null && deadlineDiffDays >= 0 && deadlineDiffDays < 3;
  const isDeadlinePast = deadlineDiffDays !== null && deadlineDiffDays < 0;
  const domain = application.job_url ? extractDomain(application.job_url) : null;
  const salaryDisplay = formatSalaryRange(
    application.salary_min,
    application.salary_max
  );

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "interactive-lift group mb-3 rounded-[22px] border border-white/70 bg-white/94 p-3.5 shadow-card backdrop-blur-sm",
            "transition-[transform,box-shadow,border-color,opacity] duration-200",
            snapshot.isDragging &&
              "rotate-[1.4deg] border-accent-orange/20 shadow-[0_20px_40px_rgba(20,20,19,0.12)] opacity-95"
          )}
        >
          {/* Company + delete */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <Link
              href={`/bewerbung/${application.id}`}
              prefetch={false}
              className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-ring/12"
            >
              <CompanyLogo
                companyName={application.company_name}
                domain={domain}
                size={28}
              />
              <div className="min-w-0">
                <span className="block truncate text-sm font-heading font-medium text-dark transition-colors duration-150 hover:text-accent-orange">
                  {application.company_name}
                </span>
                <span className="block text-[11px] font-heading uppercase tracking-[0.1em] text-muted-foreground">
                  Aktualisiert {relativeDate(application.updated_at)}
                </span>
              </div>
            </Link>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(application.id);
                }}
                aria-label={`${application.company_name} löschen`}
                title="Bewerbung löschen"
                className="rounded-full p-1.5 text-muted-foreground transition-all hover:bg-orange-50 hover:text-orange-600 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="rounded-[18px] border border-border/60 bg-dark-50/72 px-3 py-2.5">
            <Link
              href={`/bewerbung/${application.id}`}
              prefetch={false}
              className="block rounded-sm text-sm font-heading font-medium text-dark line-clamp-2 transition-colors duration-150 hover:text-accent-orange focus:outline-none focus:ring-4 focus:ring-ring/12"
            >
              {application.role_title}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {application.location && (
                <Badge variant="muted">
                  <MapPin size={10} className="mr-1" />
                  {application.location}
                </Badge>
              )}
              {salaryDisplay && <Badge variant="green">{salaryDisplay}</Badge>}
              {application.employment_type && (
                <Badge variant="blue">{application.employment_type}</Badge>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
            <span className="flex items-center gap-1 text-[11px] font-heading text-muted-foreground">
              <Clock size={10} />
              Hinzugefügt {relativeDate(application.date_saved)}
            </span>

            {hasDeadline && (
              <span
                className={cn(
                  "text-[11px] font-heading flex items-center gap-1 rounded-full px-2 py-1",
                  isDeadlinePast
                    ? "bg-orange-50 text-orange-600"
                    : isDeadlineSoon
                      ? "bg-orange-50 text-accent-orange"
                      : "bg-dark-50 text-muted-foreground"
                )}
              >
                <Calendar size={10} />
                {formatDateShort(application.deadline!)}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
