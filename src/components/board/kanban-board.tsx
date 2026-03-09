"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Briefcase,
  CalendarClock,
  Layers3,
  MoveRight,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  deleteApplication,
  restoreApplicationSnapshots,
  undoImportedContactCreation,
} from "@/actions/applications";
import { AddApplicationDialog } from "@/components/board/add-application-dialog";
import { KanbanColumn } from "@/components/board/kanban-column";
import { NextStepPromptsCard } from "@/components/next-step/next-step-prompts-card";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getStatusLabel } from "@/lib/utils/applications";
import { cn } from "@/lib/utils/cn";
import { COLUMN_CONFIG } from "@/lib/utils/constants";
import { useKanban } from "@/hooks/use-kanban";
import type {
  ApplicationOverview,
  CreateApplicationResult,
} from "@/types/application";
import type { NextStepPrompt } from "@/types/next-step";

interface KanbanBoardProps {
  initialApplications: ApplicationOverview[];
  prompts: NextStepPrompt[];
}

export function KanbanBoard({ initialApplications, prompts }: KanbanBoardProps) {
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleApplicationCreated = useCallback(
    (result: CreateApplicationResult) => {
      addApplication(result.application);

      if (result.importedContact) {
        toast({
          message: "Kontakt aus der Stelle übernommen",
          variant: "success",
          duration: 5200,
          action: {
            label: "Rückgängig",
            onClick: async () => {
              try {
                await undoImportedContactCreation(
                  result.application.id,
                  result.importedContact!.id
                );
                router.refresh();
                toast("Kontakt wieder entfernt", "success");
              } catch {
                toast("Das Rückgängigmachen hat nicht geklappt", "error");
              }
            },
          },
        });
        window.setTimeout(() => {
          if (isMountedRef.current) {
            router.refresh();
          }
        }, 5400);
        return;
      }

      toast("Bewerbung gespeichert", "success");
      window.setTimeout(() => {
        if (isMountedRef.current) {
          router.refresh();
        }
      }, 800);
    },
    [addApplication, router, toast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const removedApplication =
        applications.find((application) => application.id === id) || null;

      if (!removedApplication) {
        return;
      }

      removeApplication(id);

      const timeoutId = window.setTimeout(async () => {
        try {
          await deleteApplication(id);
          if (isMountedRef.current) {
            router.refresh();
          }
        } catch {
          if (isMountedRef.current) {
            addApplication(removedApplication);
            toast("Bewerbung konnte nicht gelöscht werden", "error");
          }
        }
      }, 5200);

      toast({
        message: "Bewerbung entfernt",
        variant: "success",
        duration: 5200,
        action: {
          label: "Rückgängig",
          onClick: () => {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
              addApplication(removedApplication);
              toast("Bewerbung wiederhergestellt", "success");
            }
          },
        },
      });
    },
    [addApplication, applications, removeApplication, router, toast]
  );

  const handleBoardDragEnd = useCallback(
    (result: Parameters<typeof handleDragEnd>[0]) => {
      handleDragEnd(result, {
        onStatusMoveCommitted: ({
          previousApplications,
          sourceStatus,
          destStatus,
        }) => {
          const snapshot = previousApplications
            .filter(
              (application) =>
                application.status === sourceStatus ||
                application.status === destStatus
            )
            .map((application) => ({
              id: application.id,
              status: application.status,
              position_in_column: application.position_in_column,
              date_saved: application.date_saved,
              date_applied: application.date_applied,
              date_interview: application.date_interview,
              date_offer: application.date_offer,
              date_rejected: application.date_rejected,
            }));

          toast({
            message: `Nach ${getStatusLabel(destStatus)} verschoben`,
            variant: "success",
            duration: 5200,
            action: {
              label: "Rückgängig",
              onClick: async () => {
                try {
                  await restoreApplicationSnapshots(snapshot);
                  router.refresh();
                  toast(
                    `Status wieder auf ${getStatusLabel(sourceStatus)} gesetzt`,
                    "success"
                  );
                } catch {
                  router.refresh();
                  toast("Status konnte nicht zurückgesetzt werden", "error");
                }
              },
            },
          });
        },
        onStatusMoveFailed: () => {
          toast("Status konnte nicht aktualisiert werden", "error");
        },
      });
    },
    [handleDragEnd, router, toast]
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
  const pendingCount = applications.filter(
    (application) => application.status === "beworben"
  ).length;

  return (
    <div className="space-y-6">
      <PageHero
        kicker="Übersicht"
        title="Heute soll sofort klar sein, was Aufmerksamkeit braucht."
        description="Die Übersicht zeigt Bewegung statt Verwaltung: offene Bewerbungen, Gespräche, Entscheidungen und den sinnvollsten nächsten Schritt."
        actions={
          <>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus size={16} />
              Bewerbung hinzufügen
            </Button>
            <Link
              href="/dokumente"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(228,210,191,0.82)] bg-white/88 px-5 py-3 text-sm font-heading font-medium text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_rgba(20,20,19,0.05)] transition-all duration-200",
                "hover:-translate-y-0.5 hover:bg-white"
              )}
            >
              Dokumente öffnen
              <Layers3 size={16} />
            </Link>
            <div className="rounded-full border border-border/80 bg-white/72 px-3 py-2 text-xs font-heading text-muted-foreground">
              {applications.length} Bewerbung
              {applications.length === 1 ? "" : "en"}
              {isPending ? " werden aktualisiert" : " insgesamt"}
            </div>
          </>
        }
        aside={
          <>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
                label="Entschieden"
                value={decisionCount}
                helper="Angebote und Absagen"
                tone="green"
              />
            </div>
            {prompts[0] ? (
              <Link
                href={prompts[0].href}
                className="surface-card interactive-lift rounded-[28px] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-orange-50 text-accent-orange">
                    <Sparkles size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                      Heute sinnvoll
                    </p>
                    <p className="mt-2 text-base font-heading font-semibold text-dark">
                      {prompts[0].title}
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      {prompts[0].body}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="surface-card rounded-[28px] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-accent-blue">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                      Im Moment
                    </p>
                    <p className="mt-2 text-base font-heading font-semibold text-dark">
                      {pendingCount > 0
                        ? `${pendingCount} Bewerbungen könnten bald ein Nachfassen brauchen.`
                        : "Im Moment ist alles ruhig sortiert."}
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      {pendingCount > 0
                        ? "Öffne die Bewerbungen im Bereich Beworben, wenn du kurze Nachfragen oder frische Unterlagen vorbereiten willst."
                        : "Nutze die ruhige Phase für bessere Unterlagen oder neue passende Stellen."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        }
      />

      <NextStepPromptsCard prompts={prompts} />

      {hasApplications ? (
        isClient ? (
          <DragDropContext onDragEnd={handleBoardDragEnd}>
            <div className="surface-panel rounded-[36px] p-3 sm:p-4 lg:p-5">
              <div className="mb-4 flex flex-col gap-3 rounded-[28px] border border-white/60 bg-white/66 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    Bewerbungsstand
                  </p>
                  <p className="mt-2 text-lg font-heading font-semibold text-dark">
                    Ziehe einen Eintrag nur dann weiter, wenn sich für dich wirklich etwas verändert hat.
                  </p>
                  <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                    So bleibt die Übersicht ehrlich und jede Spalte behält Bedeutung.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/82 px-4 py-2 text-xs font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  <MoveRight size={12} />
                  Von gemerkt bis entschieden
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
        <div className="surface-panel rounded-[36px] p-4 sm:p-5">
          <div className="surface-card rounded-[30px] border border-dashed border-border/80 bg-white/86 p-2">
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
                    className="h-1.5 rounded-t-[26px]"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="surface-card flex min-h-[220px] flex-1 flex-col rounded-b-[26px] border border-t-0 border-border/80 bg-white/78">
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
      ? "bg-orange-50/90 text-accent-orange"
      : tone === "blue"
        ? "bg-blue-50/90 text-accent-blue"
        : "bg-green-50/90 text-accent-green";

  return (
    <div className="metric-cloud rounded-[24px] px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        </p>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-heading", toneClass)}>
          {tone === "orange" ? "Aktiv" : tone === "blue" ? "Termin" : "Status"}
        </span>
      </div>
      <p className="mt-3 text-3xl font-heading font-semibold text-dark">{value}</p>
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
    <div className="surface-panel rounded-[36px] p-3 sm:p-4">
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
