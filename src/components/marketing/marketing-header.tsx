import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MarketingHeaderProps {
  isAuthenticated: boolean;
  active?: "home" | "pricing";
}

export function MarketingHeader({
  isAuthenticated,
  active = "home",
}: MarketingHeaderProps) {
  const primaryHref = isAuthenticated ? "/board" : "/registrieren";
  const primaryLabel = isAuthenticated ? "Zur Übersicht" : "Kostenlos starten";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-background/84 backdrop-blur-md md:backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-2xl shadow-card">
            <Image src="/images/laufbahn-favicon.png" alt="Laufbahn" width={44} height={44} className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="block font-heading text-lg font-semibold tracking-tight text-dark">
              Laufbahn
            </span>
            <span className="block text-xs font-heading text-muted-foreground">
              Klar durch die Jobsuche
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-border/80 bg-white/72 p-1 shadow-card lg:flex">
          {[
            { href: "/#warum", label: "Warum?" },
            { href: "/#ablauf", label: "Ablauf" },
            { href: "/preise", label: "Preise", active: active === "pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-heading transition-colors",
                item.active
                  ? "bg-dark text-light"
                  : "text-dark-500 hover:bg-white hover:text-dark"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link
              href="/board"
              className="rounded-full px-3 py-2 text-sm font-heading font-medium text-dark-500 transition-colors hover:bg-white hover:text-dark"
            >
              Zur Übersicht
            </Link>
          ) : (
            <Link
              href="/anmelden"
              className="rounded-full px-3 py-2 text-sm font-heading font-medium text-dark-500 transition-colors hover:bg-white hover:text-dark"
            >
              Anmelden
            </Link>
          )}

          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-full bg-accent-orange px-4 py-2.5 text-sm font-heading font-medium text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
          >
            {primaryLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
