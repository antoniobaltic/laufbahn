"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { Briefcase, MoveRight, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { KanbanColumn } from "./kanban-column";
import { AddApplicationDialog } from "./add-application-dialog";
import { ColumnHeader } from "./column-header";
import { useKanban } from "@/hooks/use-kanban";
import { deleteApplication } from "@/actions/applications";
import { useToast } from "@/components/ui/toast";
import type { Application } from "@/types/application";
import { COLUMN_CONFIG } from "@/lib/utils/constants";

interface KanbanBoardProps {
  initialApplications: Application[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
    (app: Application) => {
      addApplication(app);
      router.refresh();
      toast("Bewerbung erstellt", "success");
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
        toast("Bewerbung geloescht", "success");
      } catch {
        if (removedApplication) {
          addApplication(removedApplication);
        }
        toast("Fehler beim Loeschen", "error");
      }
    },
    [addApplication, applications, removeApplication, router, toast]
  );

  const hasApplications = applications.length > 0;
  const statusCounts = columns.map((status) => ({
    status,
    count: getColumnApplications(status).length,
  }));
  const activeCount = applications.filter(
    (application) =>
      !["angebot", "abgelehnt", "ghosted"].includes(application.status)
  ).length;
  const interviewCount =
    statusCounts.find((column) => column.status === "im_gespraech")?.count || 0;
  const decisionCount = applications.filter((application) =>
    ["angebot", "abgelehnt"].includes(application.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            Bewerbungsworkspace
          </p>
          <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
            Board
          </h1>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
            Ziehe Bewerbungen durch den Funnel, öffne Details bei Bedarf und halte
            Notizen, Kontakte und Dokumente in Reichweite.
          </p>
          <p className="mt-3 text-sm text-muted-foreground font-body">
            {applications.length} Bewerbung{applications.length !== 1 ? "en" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-border/80 bg-white/70 px-3 py-2 text-xs font-heading text-muted-foreground shadow-card">
            {isPending ? "Synchronisiert..." : "Live mit Supabase verbunden"}
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg">
            <Plus size={16} />
            Neue Bewerbung
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BoardStatCard
          label="Aktive Bewerbungen"
          value={activeCount}
          tone="orange"
          helper="Alles außer Entscheidungen und Ghosting"
        />
        <BoardStatCard
          label="Gespräche"
          value={interviewCount}
          tone="blue"
          helper="Einträge im Gesprächsstatus"
        />
        <BoardStatCard
          label="Entscheidungen"
          value={decisionCount}
          tone="green"
          helper="Angebot plus Absagen"
        />
        <BoardStatCard
          label="Board-Modus"
          value={hasApplications ? "Flow" : "Start"}
          tone="neutral"
          helper={isPending ? "Änderungen werden gesichert" : "Bereit für neue Schritte"}
        />
      </div>

      {hasApplications ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="surface-panel rounded-[32px] p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
              <div className="flex items-center gap-2 text-sm font-heading text-dark-500">
                <Sparkles size={14} className="text-accent-orange" />
                Ziehe Karten horizontal durch den Bewerbungsprozess.
              </div>
              <div className="hidden items-center gap-2 text-xs font-heading text-muted-foreground sm:flex">
                <MoveRight size={12} />
                Gemerkt bis Ghosted
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
        <div className="surface-panel rounded-[32px] p-3 sm:p-4">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {columns.map((status, idx) => {
              const config = COLUMN_CONFIG[status];
              if (idx === 1) {
                return (
                  <div
                    key={status}
                    className="flex w-[min(84vw,320px)] shrink-0 snap-start flex-col sm:w-[300px] xl:w-[320px]"
                  >
                    <div
                      className="h-1.5 rounded-t-[24px]"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="surface-card flex flex-1 items-center justify-center rounded-b-[24px] border border-t-0 border-border/80 bg-white/78 p-4">
                      <EmptyState
                        icon={<Briefcase size={34} />}
                        title="Noch keine Bewerbungen"
                        description="Lege deine erste Bewerbung an. Danach bekommst du hier einen ruhigen, verschiebbaren Funnel mit Detailräumen."
                        action={
                          <Button onClick={() => setDialogOpen(true)} size="sm">
                            <Plus size={14} />
                            Erste Bewerbung
                          </Button>
                        }
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={status}
                  className="flex w-[min(84vw,320px)] shrink-0 snap-start flex-col sm:w-[300px] xl:w-[320px]"
                >
                  <div
                    className="h-1.5 rounded-t-[24px]"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="surface-card flex min-h-[240px] flex-1 flex-col rounded-b-[24px] border border-t-0 border-border/80 bg-white/78">
                    <ColumnHeader
                      title={config.title}
                      count={0}
                      color={config.color}
                    />
                    <div className="flex-1 px-3 pb-3 pt-3">
                      <div
                        className="h-full rounded-[20px] border border-dashed border-border bg-dark-50/55"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add dialog */}
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
  tone: "orange" | "blue" | "green" | "neutral";
}) {
  const toneClass =
    tone === "orange"
      ? "text-accent-orange"
      : tone === "blue"
        ? "text-accent-blue"
        : tone === "green"
          ? "text-accent-green"
          : "text-dark";

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
