"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Briefcase,
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
    href: "/analytics",
    label: "Auswertung",
    icon: BarChart3,
    disabled: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/70 bg-white/68 lg:flex">
      {/* Logo */}
      <div className="border-b border-border/70 px-6 py-6">
        <Link href="/board" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-orange shadow-card">
            <span className="text-white font-heading font-bold text-sm">L</span>
          </div>
          <div>
            <span className="block font-heading text-lg font-semibold tracking-tight text-dark">
              Laufbahn
            </span>
            <span className="block text-xs font-heading text-muted-foreground">
              Bewerbungen entspannt organisieren
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "interactive-lift flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-heading transition-colors duration-200",
                isActive
                  ? "surface-card text-dark font-medium"
                  : "text-dark-500 hover:bg-white/70 hover:text-dark"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200",
                  isActive ? "bg-orange-50 text-accent-orange" : "bg-dark-50 text-dark-500"
                )}
              >
                <Icon size={18} />
              </div>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-accent-orange">
                  Aktiv
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/70 px-4 py-5">
        <div className="surface-muted rounded-[22px] px-4 py-4">
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            Kurz gesagt
          </p>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            Alles Wichtige zu jeder Bewerbung bleibt an einem Ort: Stand, Frist,
            Gespräch und Unterlagen.
          </p>
        </div>
      </div>
    </aside>
  );
}
