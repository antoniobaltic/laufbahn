"use client";

import type { ReminderItem } from "@/types/reminder";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu, LogOut, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getAvatarColorOption,
  getDisplayName,
  getUserInitials,
} from "@/lib/utils/profile";
import { NotificationCenter } from "./notification-center";
import { MobileNav } from "./mobile-nav";
import type { AvatarColor } from "@/types/profile";

interface TopbarProps {
  userEmail?: string;
  userName?: string;
  avatarColor?: AvatarColor;
  reminders: ReminderItem[];
  onSignOut: () => void;
}

export function Topbar({
  userEmail,
  userName,
  avatarColor,
  reminders,
  onSignOut,
}: TopbarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);
  const showRouteMeta = routeMeta.showInTopbar;
  const initials = getUserInitials(userName, userEmail);
  const avatarStyle = getAvatarColorOption(avatarColor);
  const displayName = getDisplayName(userName, userEmail);
  const todayLabel = new Intl.DateTimeFormat("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <>
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "surface-panel mx-auto flex w-full max-w-[1520px] items-center justify-between gap-4 rounded-[26px] px-4 sm:px-5",
            showRouteMeta ? "min-h-[88px] py-3" : "min-h-[74px] py-3"
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
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="eyebrow-badge hidden sm:inline-flex">
                  <CalendarDays size={12} />
                  {todayLabel}
                </div>
                <p className="hidden text-sm font-body text-dark-500 xl:block">
                  Klar arbeiten, Details nur dann, wenn du sie brauchst.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter reminders={reminders} />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="surface-rail flex items-center gap-2 rounded-full p-1.5 pr-3 transition-colors hover:bg-white/90 cursor-pointer"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-heading font-semibold"
                  style={{
                    backgroundColor: avatarStyle.backgroundColor,
                    color: avatarStyle.textColor,
                  }}
                >
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-heading text-muted-foreground">Konto</p>
                  <p className="max-w-40 truncate text-sm font-heading text-dark">
                    {displayName}
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-72 rounded-[26px] border border-[rgba(228,210,191,0.74)] bg-[#fcfbf8]/98 py-2 shadow-dialog backdrop-blur-lg md:backdrop-blur-xl">
                    {userEmail && (
                      <div className="border-b border-border/70 px-4 py-3">
                        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                          Angemeldet als
                        </p>
                        <p className="truncate text-sm font-heading text-dark">
                          {displayName}
                        </p>
                        <p className="mt-1 truncate text-xs font-heading text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    )}
                    <Link
                      href="/einstellungen"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        "mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-heading",
                        "text-dark-500 transition-colors hover:bg-white hover:text-dark cursor-pointer"
                      )}
                    >
                      <Settings2 size={16} />
                      <span>Profil & Einstellungen</span>
                    </Link>
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
  if (pathname.startsWith("/einstellungen")) {
    return {
      kicker: "Konto",
      title: "Profil & Einstellungen",
      description:
        "Passe Name, Erinnerungen und den Auftritt deines Profils an.",
      showInTopbar: false,
    };
  }

  if (pathname.startsWith("/analytics")) {
    return {
      kicker: "Auswertung",
      title: "Bewerbungen besser lesen",
      description:
        "Sieh, wie viele Bewerbungen offen sind, wo Rückmeldungen kommen und was gerade Aufmerksamkeit braucht.",
      showInTopbar: false,
    };
  }

  if (pathname.startsWith("/dokumente/")) {
    return {
      kicker: "Dokumente",
      title: "Fassungen pflegen und wiederfinden",
      description:
        "Bearbeite Fassungen, hole frühere Stände zurück und sieh, wo sie schon verwendet werden.",
      showInTopbar: true,
    };
  }

  if (pathname.startsWith("/dokumente")) {
    return {
      kicker: "Dokumente",
      title: "Lebensläufe und Anschreiben",
      description:
        "Halte gute Grundlagen bereit, leite Varianten daraus ab und verknüpfe feste Fassungen mit Bewerbungen.",
      showInTopbar: false,
    };
  }

  if (pathname.startsWith("/bewerbung/")) {
    return {
      kicker: "Bewerbung",
      title: "Alles zu dieser Bewerbung an einem Ort",
      description:
        "Stand, Verlauf, Kontakte und Unterlagen bleiben in einer klaren, gut sortierten Ansicht zusammen.",
      showInTopbar: true,
    };
  }

  if (pathname.startsWith("/bewerbung")) {
    return {
      kicker: "Bewerbungen",
      title: "Alle Einträge",
      description:
        "Hier findest du jede Bewerbung gesammelt und springst mit einem Klick in die Details.",
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
