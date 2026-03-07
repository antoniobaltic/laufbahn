"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/board", label: "Übersicht", icon: LayoutDashboard },
  { href: "/bewerbung", label: "Bewerbungen", icon: Briefcase },
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 fade-in bg-dark/42 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="surface-panel fade-in-up fixed inset-y-3 left-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-[28px] border border-white/75 bg-[#fcfbf8]/96 shadow-dialog">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-orange shadow-card">
              <span className="text-white font-heading font-bold text-sm">
                L
              </span>
            </div>
            <div>
              <span className="block font-heading text-lg font-semibold text-dark">
                Laufbahn
              </span>
              <span className="block text-xs font-heading text-muted-foreground">
                Bewerbungen entspannt organisieren
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white hover:text-dark cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2 px-4 py-5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "interactive-lift flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-heading transition-colors duration-200",
                  isActive
                    ? "surface-card text-dark font-medium"
                    : "text-dark-500 hover:bg-white hover:text-dark"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    isActive ? "bg-orange-50 text-accent-orange" : "bg-dark-50 text-dark-500"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-5">
          <div className="surface-muted rounded-[22px] px-4 py-4">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Tipp
            </p>
            <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
              Öffne eine Bewerbung, sobald du mehr Kontext brauchst. Notizen,
              Gespräche und Unterlagen liegen dort direkt bereit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
