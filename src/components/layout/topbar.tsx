"use client";

import type { ReminderItem } from "@/types/reminder";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
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
  const showRouteMeta = routeMeta.showInTopbar;
  const initials = userEmail?.slice(0, 2).toUpperCase() || "LB";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/78 backdrop-blur-md md:backdrop-blur-xl">
        <div
          className={cn(
            "mx-auto flex w-full max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8",
            showRouteMeta ? "h-[78px]" : "h-16 sm:h-[68px]"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              className="lg:hidden rounded-full p-2 text-dark-500 transition-colors hover:bg-white cursor-pointer"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>

            {showRouteMeta ? (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="hidden sm:inline">{routeMeta.kicker}</span>
                  <span className="sm:hidden">Laufbahn</span>
                </div>
                <div className="mt-1">
                  <h1 className="truncate font-heading text-base font-semibold text-dark sm:text-lg">
                    {routeMeta.title}
                  </h1>
                </div>
                <p className="mt-1 hidden truncate text-xs font-body text-dark-500 md:block">
                  {routeMeta.description}
                </p>
              </div>
            ) : (
              <div className="flex-1" />
            )}
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
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-[22px] border border-border/80 bg-[#fcfbf8]/98 py-2 shadow-dialog backdrop-blur-lg md:backdrop-blur-xl">
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
      kicker: "Auswertung",
      title: "Bewerbungen verstehen",
      description:
        "Sieh, wie viele Bewerbungen offen sind, wo Antworten kommen und was gerade Aufmerksamkeit braucht.",
      showInTopbar: false,
    };
  }

  if (pathname.startsWith("/bewerbung/")) {
    return {
      kicker: "Bewerbung",
      title: "Alle Details an einem Ort",
      description:
        "Bearbeite Stand, Notizen, Kontakte, Unterlagen und Gespräche ohne zwischen Tools zu wechseln.",
      showInTopbar: true,
    };
  }

  if (pathname.startsWith("/bewerbung")) {
    return {
      kicker: "Bewerbungen",
      title: "Alle Einträge",
      description:
        "Hier findest du jede Bewerbung gesammelt und kommst mit einem Klick zu allen Details.",
      showInTopbar: false,
    };
  }

  return {
    kicker: "Heute",
    title: "Übersicht",
    description:
      "Behalte offene Bewerbungen, Gespräche und Fristen in einem ruhigen Überblick im Blick.",
    showInTopbar: false,
  };
}
