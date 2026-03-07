"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { updateApplicationStatusFromDetail } from "@/actions/applications";
import { useOfferCelebration } from "@/components/celebration/offer-celebration-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import {
  getStatusColors,
  getStatusLabel,
} from "@/lib/utils/applications";
import {
  COLUMN_ORDER,
  type ApplicationStatus,
} from "@/lib/utils/constants";

interface ApplicationStatusEditorProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  companyName?: string;
  roleTitle?: string;
}

export function ApplicationStatusEditor({
  applicationId,
  currentStatus,
  companyName,
  roleTitle,
}: ApplicationStatusEditorProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const { celebrateOffer } = useOfferCelebration();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const isDirty = selectedStatus !== currentStatus;

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateApplicationStatusFromDetail(applicationId, selectedStatus);
        if (selectedStatus === "angebot" && currentStatus !== "angebot") {
          celebrateOffer({ companyName, roleTitle });
        }
        toast("Status aktualisiert", "success");
        router.refresh();
      } catch {
        toast("Status konnte nicht gespeichert werden", "error");
      }
    });
  };

  return (
    <div className="surface-card rounded-[28px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            Stand der Bewerbung
          </p>
          <h2 className="mt-2 text-lg font-heading font-semibold text-dark">
            Schnell anpassen
          </h2>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            Änderungen erscheinen automatisch in der Übersicht und im Verlauf.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {COLUMN_ORDER.map((status) => {
          const colors = getStatusColors(status);
          const isSelected = selectedStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "rounded-[18px] border px-3 py-3 text-left transition-[transform,box-shadow,border-color,background-color] duration-200",
                "hover:-translate-y-0.5 hover:shadow-card-hover",
                isSelected
                  ? "shadow-card"
                  : "border-border/80 bg-white/80 hover:border-dark-200"
              )}
              style={
                isSelected
                  ? {
                      borderColor: colors.color,
                      backgroundColor: colors.backgroundColor,
                    }
                  : undefined
              }
            >
              <span className="flex items-center gap-2 text-sm font-heading font-medium text-dark">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors.color }}
                />
                {getStatusLabel(status)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-heading text-muted-foreground">
          <Sparkles size={12} className="text-accent-orange" />
          Jede Änderung landet automatisch im Verlauf.
        </div>

        <div className="flex flex-wrap gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStatus(currentStatus)}
            >
              <RefreshCcw size={14} />
              Zurücksetzen
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Speichert...
              </>
            ) : (
              "Status speichern"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
