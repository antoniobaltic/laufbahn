"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  BarChart3,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  {
    href: "/board",
    label: "Übersicht",
    icon: LayoutDashboard,
  },
  {
    href: "/bewerbung",
    label: "Bewerbungen",
    icon: Briefcase,
    disabled: false,
  },
  {
    href: "/dokumente",
    label: "Dokumente",
    icon: FileText,
  },
  {
    href: "/analytics",
    label: "Auswertung",
    icon: BarChart3,
    disabled: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 px-4 py-4 lg:flex">
      <div className="surface-panel flex h-full w-full flex-col rounded-[34px] p-4">
        <div className="surface-stage rounded-[28px] px-5 py-5">
          <Link href="/board" className="flex items-start gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-[20px] shadow-[0_14px_28px_rgba(217,119,87,0.24)]">
              <Image src="/images/laufbahn-favicon2.png" alt="Laufbahn" width={48} height={48} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="block font-heading text-xl font-semibold tracking-tight text-dark">
                Laufbahn
              </span>
              <span className="mt-1 block text-sm font-body leading-relaxed text-dark-500">
                Der ruhige Ort für Bewerbungen, Gespräche und passende Unterlagen.
              </span>
            </div>
          </Link>

          <div className="mt-5 flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            <span className="eyebrow-badge">Für DACH gemacht</span>
          </div>
        </div>

        <div className="mt-4 px-2">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            Navigation
          </p>
        </div>

        <nav className="mt-3 flex-1 space-y-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "interactive-lift flex items-center gap-3 rounded-[24px] px-4 py-3.5 text-sm font-heading transition-colors duration-200",
                isActive
                  ? "surface-card text-dark font-medium"
                  : "text-dark-500 hover:bg-white/74 hover:text-dark"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[18px] transition-colors duration-200",
                  isActive
                    ? "bg-orange-50/90 text-accent-orange"
                    : "bg-dark-50/70 text-dark-500"
                )}
              >
                  <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block">{item.label}</span>
                <span className="block text-xs font-body text-muted-foreground">
                  {getNavHint(item.href)}
                </span>
              </div>
              {isActive && (
                <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-dark text-light">
                  <ArrowRight size={14} />
                </span>
              )}
            </Link>
          );
        })}
        </nav>

        <div className="surface-rail rounded-[28px] px-4 py-4">
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            So bleibt es ruhig
          </p>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            Erst klar sehen, was heute wichtig ist. Mehr Tiefe öffnet sich erst
            dann, wenn du sie wirklich brauchst.
          </p>
        </div>
      </div>
    </aside>
  );
}

function getNavHint(href: string) {
  if (href === "/board") {
    return "Heute im Blick";
  }

  if (href === "/bewerbung") {
    return "Alle Einträge";
  }

  if (href === "/dokumente") {
    return "Unterlagen sortiert";
  }

  return "Muster erkennen";
}
