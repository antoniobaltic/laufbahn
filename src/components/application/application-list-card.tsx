import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/company/company-logo";
import { StatusPill } from "@/components/application/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSalaryRange } from "@/lib/utils/applications";
import { relativeDate } from "@/lib/utils/dates";
import { extractDomain } from "@/lib/utils/url";
import type { Application } from "@/types/application";

interface ApplicationListCardProps {
  application: Application;
}

export function ApplicationListCard({ application }: ApplicationListCardProps) {
  const domain = application.job_url ? extractDomain(application.job_url) : null;
  const salaryDisplay = formatSalaryRange(
    application.salary_min,
    application.salary_max
  );

  return (
    <Link href={`/bewerbung/${application.id}`} className="group block">
      <Card className="interactive-lift h-full rounded-[28px]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <CompanyLogo
              companyName={application.company_name}
              domain={domain}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-heading font-medium text-dark">
                {application.company_name}
              </p>
              <p className="truncate text-xs font-heading uppercase tracking-[0.1em] text-muted-foreground">
                Aktualisiert {relativeDate(application.updated_at)}
              </p>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-accent-orange"
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-[22px] border border-border/70 bg-dark-50/75 p-4">
            <h2 className="text-base font-heading font-semibold text-dark">
              {application.role_title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill status={application.status} />
              {application.location && (
                <Badge variant="muted">
                  <MapPin size={10} className="mr-1" />
                  {application.location}
                </Badge>
              )}
              {application.employment_type && (
                <Badge variant="blue">{application.employment_type}</Badge>
              )}
              {salaryDisplay && <Badge variant="green">{salaryDisplay}</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-heading text-muted-foreground">
            <Clock size={12} />
            <span>Gespeichert {relativeDate(application.date_saved)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
