import Link from "next/link";
import { ArrowRight, Files, Sparkles } from "lucide-react";
import { getApplications } from "@/actions/applications";
import { ApplicationListCard } from "@/components/application/application-list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  const sortedApplications = [...applications].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const activeApplications = applications.filter(
    (application) =>
      !["angebot", "abgelehnt", "ghosted"].includes(application.status)
  ).length;
  const recentlyUpdated = sortedApplications.slice(0, 3).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            Detailräume
          </p>
          <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
            Bewerbungen
          </h1>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
            Öffne eine Bewerbung für Timeline, Notizen, Kontakte, Dokumente und
            den kompletten Gesprächskontext.
          </p>
        </div>
        <Link
          href="/board"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/78 px-4 py-2.5 text-sm font-heading font-medium text-dark transition-all duration-200",
            "hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
          )}
        >
          Zum Board
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ListMetric
          label="Gesamt"
          value={String(applications.length)}
          helper="Alle aktuell angelegten Bewerbungen"
        />
        <ListMetric
          label="Aktiv"
          value={String(activeApplications)}
          helper="Noch im laufenden Prozess"
        />
        <ListMetric
          label="Zuletzt bewegt"
          value={String(recentlyUpdated)}
          helper="Die drei neuesten Updates zuerst"
        />
      </div>

      {sortedApplications.length > 0 ? (
        <div className="surface-panel rounded-[32px] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-heading text-dark-500">
            <Sparkles size={14} className="text-accent-orange" />
            Jede Karte öffnet den kompletten Detailraum der Bewerbung.
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
            title="Noch keine Bewerbungen zum Öffnen"
            description="Lege zuerst im Board eine Bewerbung an. Danach findest du hier die Detailansicht mit Timeline und Kontext."
            action={
              <Link
                href="/board"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2 text-sm font-heading font-medium text-white transition-colors duration-150",
                  "hover:bg-orange-500"
                )}
              >
                Zum Board
                <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}

function ListMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="surface-card interactive-lift rounded-[24px] px-5 py-4">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-heading font-semibold text-dark">{value}</p>
      <p className="mt-2 text-sm font-body text-dark-500">{helper}</p>
    </div>
  );
}
