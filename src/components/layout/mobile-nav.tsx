"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  BarChart3,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/board", label: "Übersicht", icon: LayoutDashboard },
  { href: "/bewerbung", label: "Bewerbungen", icon: Briefcase },
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/analytics", label: "Auswertung", icon: BarChart3 },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 fade-in bg-dark/42 backdrop-blur-[2px] sm:backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="surface-panel fade-in-up fixed inset-y-3 left-3 w-[min(23rem,calc(100vw-1.5rem))] rounded-[32px] border border-white/75 bg-[#fcfbf8]/96 p-3 shadow-dialog">
        <div className="surface-stage rounded-[26px] px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 overflow-hidden rounded-[18px] shadow-card">
              <Image src="/images/laufbahn-favicon.png" alt="Laufbahn" width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="block font-heading text-lg font-semibold text-dark">
                Laufbahn
              </span>
              <span className="block text-xs font-heading text-muted-foreground">
                Klar sehen, dann weiterkommen
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pb-2 pt-4">
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            Navigation
          </p>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white hover:text-dark cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2 px-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "interactive-lift flex items-center gap-3 rounded-[24px] px-4 py-3.5 text-sm font-heading transition-colors duration-200",
                  isActive
                    ? "surface-card text-dark font-medium"
                    : "text-dark-500 hover:bg-white hover:text-dark"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[18px]",
                    isActive
                      ? "bg-orange-50 text-accent-orange"
                      : "bg-dark-50 text-dark-500"
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <span className="block">{item.label}</span>
                  <span className="block text-xs font-body text-muted-foreground">
                    {getNavHint(item.href)}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-1 pb-1 pt-3">
          <div className="surface-rail rounded-[24px] px-4 py-4">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Tipp
            </p>
            <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
              Öffne auf der Detailseite nur den Bereich, den du gerade brauchst,
              statt alles gleichzeitig lesen zu müssen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNavHint(href: string) {
  if (href === "/board") return "Heute im Blick";
  if (href === "/bewerbung") return "Alle Einträge";
  if (href === "/dokumente") return "Unterlagen sortiert";
  return "Muster erkennen";
}
