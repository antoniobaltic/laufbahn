"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateCurrentProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  AVATAR_COLOR_OPTIONS,
  DEADLINE_REMINDER_OPTIONS,
  getAvatarColorOption,
  getUserInitials,
  INTERVIEW_REMINDER_OPTIONS,
} from "@/lib/utils/profile";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/types/profile";

interface ProfileSettingsFormProps {
  profile: UserProfile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [avatarColor, setAvatarColor] = useState(profile.avatar_color);
  const [deadlineReminderDays, setDeadlineReminderDays] = useState(
    String(profile.deadline_reminder_days)
  );
  const [interviewReminderHours, setInterviewReminderHours] = useState(
    String(profile.interview_reminder_hours)
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const previewStyle = useMemo(
    () => getAvatarColorOption(avatarColor),
    [avatarColor]
  );

  const isDirty =
    fullName.trim() !== (profile.full_name || "") ||
    avatarColor !== profile.avatar_color ||
    Number(deadlineReminderDays) !== profile.deadline_reminder_days ||
    Number(interviewReminderHours) !== profile.interview_reminder_hours;

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCurrentProfile({
          full_name: fullName,
          avatar_color: avatarColor,
          deadline_reminder_days: Number(deadlineReminderDays),
          interview_reminder_hours: Number(interviewReminderHours),
        });
        toast("Einstellungen gespeichert", "success");
        router.refresh();
      } catch {
        toast("Einstellungen konnten nicht gespeichert werden", "error");
      }
    });
  };

  const handleReset = () => {
    setFullName(profile.full_name || "");
    setAvatarColor(profile.avatar_color);
    setDeadlineReminderDays(String(profile.deadline_reminder_days));
    setInterviewReminderHours(String(profile.interview_reminder_hours));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
      <Card className="rounded-[30px]">
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Profil
            </p>
            <h2 className="text-lg font-heading font-semibold text-dark">
              So wirkst du in Laufbahn
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            id="settings-name"
            label="Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Wie sollen wir dich ansprechen?"
          />

          <Input
            id="settings-email"
            label="E-Mail"
            value={profile.email}
            readOnly
            disabled
          />

          <div className="space-y-3">
            <div>
              <p className="text-sm font-heading font-medium text-dark-700">
                Hintergrund der Initialen
              </p>
              <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                Die Farbe erscheint oben rechts in deinem Profilkreis.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLOR_OPTIONS.map((option) => {
                const isSelected = option.value === avatarColor;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvatarColor(option.value)}
                    className={cn(
                      "rounded-[22px] border px-3 py-3 text-left transition-all duration-200",
                      isSelected
                        ? "border-dark-200 bg-white shadow-card"
                        : "border-border/80 bg-white/78 hover:border-dark-200 hover:shadow-card"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-heading font-semibold"
                        style={{
                          backgroundColor: option.backgroundColor,
                          color: option.textColor,
                          border: `1px solid ${option.borderColor}`,
                        }}
                      >
                        {getUserInitials(fullName, profile.email)}
                      </div>
                      <div>
                        <p className="text-sm font-heading text-dark">
                          {option.label}
                        </p>
                        <p className="text-xs font-body text-muted-foreground">
                          {isSelected ? "Aktuell ausgewählt" : "Als Profilfarbe nutzen"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[30px]">
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Erinnerungen
            </p>
            <h2 className="text-lg font-heading font-semibold text-dark">
              Wann Laufbahn dich erinnert
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Select
            id="settings-deadline-reminder"
            label="Fristen"
            options={DEADLINE_REMINDER_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            value={deadlineReminderDays}
            onChange={(e) => setDeadlineReminderDays(e.target.value)}
          />

          <Select
            id="settings-interview-reminder"
            label="Gespräche"
            options={INTERVIEW_REMINDER_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            value={interviewReminderHours}
            onChange={(e) => setInterviewReminderHours(e.target.value)}
          />

          <div className="rounded-[22px] border border-border/80 bg-dark-50/68 px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-heading font-semibold"
                style={{
                  backgroundColor: previewStyle.backgroundColor,
                  color: previewStyle.textColor,
                  border: `1px solid ${previewStyle.borderColor}`,
                }}
              >
                {getUserInitials(fullName, profile.email)}
              </div>
              <div>
                <p className="text-sm font-heading text-dark">Vorschau</p>
                <p className="text-sm font-body text-dark-500">
                  Diese Standards gelten für Erinnerungen und hilfreiche Hinweise.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty || isPending}
            >
              Zurücksetzen
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
