"use client";

import type { ReminderItem } from "@/types/reminder";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NotificationCenter } from "./notification-center";
import { MobileNav } from "./mobile-nav";

interface TopbarProps {
  userEmail?: string;
  reminders: ReminderItem[];
  onSignOut: () => void;
}

export function Topbar({ userEmail, reminders, onSignOut }: TopbarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);
  const initials = userEmail?.slice(0, 2).toUpperCase() || "LB";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/78 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] w-full max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="lg:hidden rounded-full p-2 text-dark-500 transition-colors hover:bg-white cursor-pointer"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles size={12} className="text-accent-orange" />
              <span className="hidden sm:inline">{routeMeta.kicker}</span>
              <span className="sm:hidden">Laufbahn</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="truncate font-heading text-base font-semibold text-dark sm:text-lg">
                {routeMeta.title}
              </h1>
              <span className="hidden rounded-full border border-border/70 bg-white/70 px-2.5 py-1 text-[11px] font-heading text-muted-foreground md:inline-flex">
                {routeMeta.badge}
              </span>
            </div>
            <p className="mt-1 hidden truncate text-xs font-body text-dark-500 md:block">
              {routeMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter reminders={reminders} />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="surface-panel flex items-center gap-2 rounded-full p-1.5 pr-3 transition-colors hover:bg-white/90 cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark text-xs font-heading font-semibold text-light">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-heading text-muted-foreground">Konto</p>
                  <p className="max-w-40 truncate text-sm font-heading text-dark">
                    {userEmail || "Laufbahn"}
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-[22px] border border-border/80 bg-[#fcfbf8]/98 py-2 shadow-dialog backdrop-blur-xl">
                    {userEmail && (
                      <div className="border-b border-border/70 px-4 py-3">
                        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                          Angemeldet als
                        </p>
                        <p className="truncate text-xs font-heading text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className={cn(
                        "mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-heading",
                        "text-dark-500 transition-colors hover:bg-white hover:text-dark cursor-pointer"
                      )}
                    >
                      <LogOut size={16} />
                      <span>Abmelden</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}

function getRouteMeta(pathname: string) {
  if (pathname.startsWith("/analytics")) {
    return {
      kicker: "Funnel Intelligence",
      title: "Analytics",
      badge: "Auswertung",
      description:
        "Antwortquote, Funnel-Tempo und Arbeitsqualität in einer ruhigen Sicht.",
    };
  }

  if (pathname.startsWith("/bewerbung/")) {
    return {
      kicker: "Bewerbungsdetail",
      title: "Bewerbung im Fokus",
      badge: "Detailansicht",
      description:
        "Status, Notizen, Kontakte und Dokumente an einem Ort pflegen.",
    };
  }

  if (pathname.startsWith("/bewerbung")) {
    return {
      kicker: "Workspace",
      title: "Bewerbungen",
      badge: "Liste",
      description:
        "Wechsle von der Übersicht direkt in Kontext, Timeline und Folgeaktionen.",
    };
  }

  return {
    kicker: "Workspace",
    title: "Board",
    badge: "Kanban",
    description:
      "Verschiebe Bewerbungen, erkenne Blocker früh und halte den Funnel aktuell.",
  };
}
