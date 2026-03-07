"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClockCheck,
  Bell,
  CalendarClock,
  ChevronRight,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getReminderCounts } from "@/lib/utils/reminders";
import { cn } from "@/lib/utils/cn";
import { formatDateShort, formatDateTime, relativeDate } from "@/lib/utils/dates";
import type { ReminderItem } from "@/types/reminder";

interface NotificationCenterProps {
  reminders: ReminderItem[];
}

export function NotificationCenter({ reminders }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const counts = useMemo(() => getReminderCounts(reminders), [reminders]);
  const visibleReminders = reminders.slice(0, 8);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="surface-panel relative flex h-12 w-12 items-center justify-center rounded-full text-dark-500 transition-colors hover:bg-white/90 hover:text-dark cursor-pointer"
        aria-label="Erinnerungen öffnen"
      >
        <Bell size={18} />
        {counts.total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent-orange px-1.5 text-[10px] font-heading font-semibold text-white shadow-card">
            {counts.total > 9 ? "9+" : counts.total}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[min(28rem,calc(100vw-1.5rem))] rounded-[24px] border border-border/80 bg-[#fcfbf8]/98 p-3 shadow-dialog backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 px-2 pb-3 pt-1">
              <div>
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Erinnerungen
                </p>
                <h2 className="mt-1 text-base font-heading font-semibold text-dark">
                  {counts.total > 0
                    ? `${counts.total} offene Aufgaben`
                    : "Nichts Dringendes"}
                </h2>
              </div>
              {counts.total > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  {counts.high > 0 && <Badge variant="orange">{counts.high} hoch</Badge>}
                  {counts.medium > 0 && (
                    <Badge variant="blue">{counts.medium} mittel</Badge>
                  )}
                  {counts.low > 0 && <Badge variant="muted">{counts.low} ruhig</Badge>}
                </div>
              )}
            </div>

            {visibleReminders.length > 0 ? (
              <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                {visibleReminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    href={reminder.href}
                    onClick={() => setOpen(false)}
                    className="group block rounded-[20px] border border-border/80 bg-white/86 p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-dark-200 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border",
                            reminder.urgency === "high" &&
                              "border-orange-200 bg-orange-50 text-accent-orange",
                            reminder.urgency === "medium" &&
                              "border-blue-200 bg-blue-50 text-accent-blue",
                            reminder.urgency === "low" &&
                              "border-border/80 bg-dark-50 text-dark-500"
                          )}
                        >
                          <ReminderIcon type={reminder.type} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-heading font-semibold text-dark">
                              {reminder.title}
                            </p>
                            <Badge variant={getUrgencyBadgeVariant(reminder.urgency)}>
                              {getUrgencyLabel(reminder.urgency)}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                            {reminder.body}
                          </p>
                          {reminder.meta && (
                            <p className="mt-2 line-clamp-2 text-xs font-body leading-relaxed text-muted-foreground">
                              {reminder.meta}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-heading uppercase tracking-[0.08em] text-muted-foreground">
                            <span>{getDueLabel(reminder)}</span>
                            <span>•</span>
                            <span>{relativeDate(reminder.dueAt)}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-muted-foreground transition-colors group-hover:text-dark"
                      />
                    </div>
                  </Link>
                ))}
                {reminders.length > visibleReminders.length && (
                  <div className="px-2 py-1 text-center text-xs font-heading text-muted-foreground">
                    Wir zeigen zuerst die wichtigsten Hinweise.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-border bg-dark-50/72 px-4 py-5">
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  Im Moment ist alles ruhig. Sobald eine Frist näher rückt, ein
                  Gespräch bevorsteht oder ein Follow-up sinnvoll wird, taucht der
                  Hinweis hier auf.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ReminderIcon({ type }: { type: ReminderItem["type"] }) {
  if (type === "deadline") {
    return <AlarmClockCheck size={16} />;
  }

  if (type === "interview") {
    return <CalendarClock size={16} />;
  }

  return <Send size={16} />;
}

function getUrgencyLabel(urgency: ReminderItem["urgency"]) {
  if (urgency === "high") return "Heute";
  if (urgency === "medium") return "Demnächst";
  return "Im Blick";
}

function getUrgencyBadgeVariant(urgency: ReminderItem["urgency"]) {
  if (urgency === "high") return "orange";
  if (urgency === "medium") return "blue";
  return "muted";
}

function getDueLabel(reminder: ReminderItem) {
  if (reminder.type === "deadline") {
    return formatDateShort(reminder.dueAt);
  }

  return formatDateTime(reminder.dueAt);
}
