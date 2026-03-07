"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, NotebookPen, SquarePen } from "lucide-react";
import { updateApplicationNotes } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface ApplicationNotesCardProps {
  applicationId: string;
  initialNotes: string | null;
}

export function ApplicationNotesCard({
  applicationId,
  initialNotes,
}: ApplicationNotesCardProps) {
  const [isEditing, setIsEditing] = useState(!initialNotes);
  const [draft, setDraft] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const currentValue = initialNotes || "";
  const isDirty = draft.trim() !== currentValue.trim();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateApplicationNotes(applicationId, draft);
        toast("Notizen gespeichert", "success");
        setIsEditing(false);
        router.refresh();
      } catch {
        toast("Notizen konnten nicht gespeichert werden", "error");
      }
    });
  };

  return (
    <Card className="rounded-[28px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <NotebookPen size={16} className="text-accent-blue" />
            <h2 className="text-lg font-heading font-medium text-dark">
              Notizen & Kontext
            </h2>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(currentValue);
                setIsEditing(true);
              }}
            >
              <SquarePen size={14} />
              Bearbeiten
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={7}
              placeholder="Was ist für diese Bewerbung wichtig? Gesprächsfokus, Risiken, To-dos, persönliche Einschätzung..."
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft(currentValue);
                  setIsEditing(false);
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isDirty || isPending}
                onClick={handleSave}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Speichert...
                  </>
                ) : (
                  "Notizen speichern"
                )}
              </Button>
            </div>
          </div>
        ) : initialNotes ? (
          <p className="text-sm font-body leading-7 text-dark-700">
            {initialNotes}
          </p>
        ) : (
          <div className="rounded-[22px] border border-dashed border-border bg-dark-50/70 p-5">
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Noch keine persönlichen Notizen hinterlegt. Halte Gesprächsschwerpunkte,
              Aufgaben oder dein Bauchgefühl direkt hier fest.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDraft(currentValue);
                  setIsEditing(true);
                }}
              >
                <SquarePen size={14} />
                Erste Notiz hinzufügen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
