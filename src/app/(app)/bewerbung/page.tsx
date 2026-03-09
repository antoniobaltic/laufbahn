import Link from "next/link";
import { ArrowRight, Files } from "lucide-react";
import { getApplications } from "@/actions/applications";
import { ApplicationListCard } from "@/components/application/application-list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { cn } from "@/lib/utils/cn";
import { toTimestamp } from "@/lib/utils/dates";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  const sortedApplications = [...applications].sort(
    (a, b) => toTimestamp(b.updated_at) - toTimestamp(a.updated_at)
  );

  return (
    <div className="space-y-6">
      <PageHero
        kicker="Bewerbungen"
        title="Alle Bewerbungen bleiben greifbar, ohne dich zu erschlagen."
        description="Diese Ansicht ist zum schnellen Scannen gebaut: zuletzt veränderte Bewerbungen zuerst, mit klaren Karten und direktem Sprung in die Details."
        actions={
          <>
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
            <div className="rounded-full border border-border/80 bg-white/76 px-3 py-2 text-xs font-heading text-muted-foreground shadow-card">
              {applications.length} Bewerbung
              {applications.length === 1 ? "" : "en"}
            </div>
          </>
        }
      />

      {sortedApplications.length > 0 ? (
        <div className="surface-panel rounded-[34px] p-4 sm:p-5">
          <div className="mb-4 text-sm font-body text-dark-500">
            Sortiert nach letzter Änderung, damit alles mit Bewegung direkt oben bleibt.
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
        <div className="surface-panel rounded-[34px] px-4">
          <EmptyState
            icon={<Files size={40} />}
            title="Noch keine Bewerbungen"
            description="Lege zuerst in der Übersicht deine erste Bewerbung an. Danach findest du hier alle Einträge gesammelt an einem Ort."
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
