"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { Briefcase, MoveRight, Plus } from "lucide-react";
import { deleteApplication } from "@/actions/applications";
import { AddApplicationDialog } from "@/components/board/add-application-dialog";
import { KanbanColumn } from "@/components/board/kanban-column";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { COLUMN_CONFIG } from "@/lib/utils/constants";
import { useKanban } from "@/hooks/use-kanban";
import type { Application, ApplicationOverview } from "@/types/application";

interface KanbanBoardProps {
  initialApplications: ApplicationOverview[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const router = useRouter();
  const {
    applications,
    getColumnApplications,
    handleDragEnd,
    addApplication,
    removeApplication,
    columns,
    isPending,
  } = useKanban(initialApplications);
  const { toast } = useToast();

  const handleApplicationCreated = useCallback(
    (application: Application) => {
      addApplication(application);
      router.refresh();
      toast("Bewerbung gespeichert", "success");
    },
    [addApplication, router, toast]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const removedApplication =
        applications.find((application) => application.id === id) || null;

      try {
        removeApplication(id);
        await deleteApplication(id);
        router.refresh();
        toast("Bewerbung gelöscht", "success");
      } catch {
        if (removedApplication) {
          addApplication(removedApplication);
        }
        toast("Bewerbung konnte nicht gelöscht werden", "error");
      }
    },
    [addApplication, applications, removeApplication, router, toast]
  );

  const hasApplications = applications.length > 0;
  const activeCount = applications.filter(
    (application) =>
      !["angebot", "abgelehnt", "ghosted"].includes(application.status)
  ).length;
  const interviewCount =
    applications.filter(
      (application) =>
        application.status === "im_gespraech" || Boolean(application.next_interview_at)
    ).length;
  const decisionCount = applications.filter((application) =>
    ["angebot", "abgelehnt"].includes(application.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            Übersicht
          </p>
          <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
            Deine Bewerbungen auf einen Blick
          </h1>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
            Behalte offene Bewerbungen, Gespräche und Entscheidungen in einer
            Ansicht im Blick. Mehr Details öffnest du erst dann, wenn du sie
            wirklich brauchst.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-border/80 bg-white/70 px-3 py-2 text-xs font-heading text-muted-foreground shadow-card">
            {applications.length} Bewerbung
            {applications.length === 1 ? "" : "en"}
            {isPending ? " werden aktualisiert" : " insgesamt"}
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg">
            <Plus size={16} />
            Bewerbung hinzufügen
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BoardStatCard
          label="Offen"
          value={activeCount}
          helper="Noch im laufenden Prozess"
          tone="orange"
        />
        <BoardStatCard
          label="Gespräche"
          value={interviewCount}
          helper="Mit Termin oder Gesprächsstatus"
          tone="blue"
        />
        <BoardStatCard
          label="Entscheidungen"
          value={decisionCount}
          helper="Angebote und Absagen"
          tone="green"
        />
      </div>

      {hasApplications ? (
        isClient ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="surface-panel rounded-[32px] p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
              <div className="text-sm font-body leading-relaxed text-dark-500">
                Ziehe eine Bewerbung in den nächsten Schritt, sobald sich etwas
                verändert.
              </div>
              <div className="hidden items-center gap-2 text-xs font-heading text-muted-foreground sm:flex">
                <MoveRight size={12} />
                Von gemerkt bis abgeschlossen
              </div>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {columns.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  applications={getColumnApplications(status)}
                  onDeleteApplication={handleDelete}
                />
              ))}
            </div>
          </div>
        </DragDropContext>
        ) : (
          <BoardLoadingPanel />
        )
      ) : (
        <div className="surface-panel rounded-[32px] p-4 sm:p-5">
          <div className="surface-card rounded-[28px] border border-dashed border-border/80 bg-white/86 p-2">
            <EmptyState
              icon={<Briefcase size={34} />}
              title="Noch keine Bewerbungen"
              description="Starte mit deiner ersten Bewerbung. Danach siehst du hier sofort, was offen ist und was als Nächstes dran ist."
              action={
                <Button onClick={() => setDialogOpen(true)} size="sm">
                  <Plus size={14} />
                  Erste Bewerbung anlegen
                </Button>
              }
            />
          </div>

          <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {columns.map((status) => {
              const config = COLUMN_CONFIG[status];

              return (
                <div
                  key={status}
                  className="flex w-[min(84vw,320px)] shrink-0 snap-start flex-col sm:w-[300px] xl:w-[320px]"
                >
                  <div
                    className="h-1.5 rounded-t-[24px]"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="surface-card flex min-h-[220px] flex-1 flex-col rounded-b-[24px] border border-t-0 border-border/80 bg-white/78">
                    <KanbanColumnPlaceholder title={config.title} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddApplicationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleApplicationCreated}
        existingApplications={applications}
      />
    </div>
  );
}

function BoardStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: number | string;
  helper: string;
  tone: "orange" | "blue" | "green";
}) {
  const toneClass =
    tone === "orange"
      ? "text-accent-orange"
      : tone === "blue"
        ? "text-accent-blue"
        : "text-accent-green";

  return (
    <div className="surface-card interactive-lift rounded-[24px] px-5 py-4">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-3 text-3xl font-heading font-semibold", toneClass)}>
        {value}
      </p>
      <p className="mt-2 text-sm font-body text-dark-500">{helper}</p>
    </div>
  );
}

function KanbanColumnPlaceholder({ title }: { title: string }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
        <h3 className="truncate text-sm font-heading font-semibold text-dark">
          {title}
        </h3>
        <span className="rounded-full border border-border/80 bg-white/82 px-2.5 py-1 text-[11px] font-heading font-medium text-dark-500">
          0
        </span>
      </div>
      <div className="flex flex-1 px-3 pb-3 pt-3">
        <div className="h-full min-h-[160px] w-full rounded-[20px] border border-dashed border-border bg-dark-50/55" />
      </div>
    </>
  );
}

function BoardLoadingPanel() {
  return (
    <div className="surface-panel rounded-[32px] p-3 sm:p-4">
      <div className="mb-3 px-1 text-sm font-body text-dark-500 sm:px-2">
        Die Übersicht wird vorbereitet.
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Offen", "Aktiv", "In Arbeit"].map((label) => (
          <div key={label} className="surface-card rounded-[28px] p-4">
            <div className="h-4 w-28 rounded-full bg-dark-100" />
            <div className="mt-4 space-y-3">
              <div className="skeleton-sheen h-24 rounded-[22px]" />
              <div className="skeleton-sheen h-24 rounded-[22px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
