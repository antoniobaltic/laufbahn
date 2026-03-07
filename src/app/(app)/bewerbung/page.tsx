import Link from "next/link";
import { ArrowRight, Files } from "lucide-react";
import { getApplications } from "@/actions/applications";
import { ApplicationListCard } from "@/components/application/application-list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { toTimestamp } from "@/lib/utils/dates";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  const sortedApplications = [...applications].sort(
    (a, b) => toTimestamp(b.updated_at) - toTimestamp(a.updated_at)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            Bewerbungen
          </p>
          <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
            Alle Einträge
          </h1>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
            Hier findest du jede Bewerbung gesammelt. Öffne einen Eintrag, sobald
            du Notizen, Gespräche oder Unterlagen bearbeiten möchtest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-border/80 bg-white/76 px-3 py-2 text-xs font-heading text-muted-foreground shadow-card">
            {applications.length} Bewerbung
            {applications.length === 1 ? "" : "en"}
          </div>
          <Link
            href="/board"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/78 px-4 py-2.5 text-sm font-heading font-medium text-dark transition-all duration-200",
              "hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
            )}
          >
            Zur Übersicht
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {sortedApplications.length > 0 ? (
        <div className="surface-panel rounded-[32px] p-4 sm:p-5">
          <div className="mb-4 text-sm font-body text-dark-500">
            Sortiert nach letzter Änderung, damit die wichtigsten Dinge oben bleiben.
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {sortedApplications.map((application) => (
              <ApplicationListCard
                key={application.id}
                application={application}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="surface-panel rounded-[32px] px-4">
          <EmptyState
            icon={<Files size={40} />}
            title="Noch keine Bewerbungen"
            description="Lege zuerst in der Übersicht deine erste Bewerbung an. Danach findest du hier alle Einträge gesammelt."
            action={
              <Link
                href="/board"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2 text-sm font-heading font-medium text-white transition-colors duration-150",
                  "hover:bg-orange-500"
                )}
              >
                Zur Übersicht
                <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
