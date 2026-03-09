import Link from "next/link";

interface MarketingFooterProps {
  isAuthenticated: boolean;
}

export function MarketingFooter({ isAuthenticated }: MarketingFooterProps) {
  return (
    <footer className="border-t border-border/80 bg-white/58">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
              Laufbahn
            </p>
            <p className="mt-3 text-lg font-heading font-semibold text-dark">
              Für Menschen, die ihre Bewerbungen klar, ruhig und mit etwas Freude organisieren wollen.
            </p>
            <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
              Für Deutschland und Österreich geschrieben, freundlich im Ton und
              bewusst ohne Verwaltungskälte.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/preise"
              className="rounded-full border border-border/80 bg-white/82 px-4 py-2 text-sm font-heading text-dark-500 transition-colors hover:text-dark"
            >
              Preise
            </Link>
            <Link
              href={isAuthenticated ? "/board" : "/registrieren"}
              className="rounded-full bg-dark px-4 py-2 text-sm font-heading text-light transition-colors hover:bg-dark-800"
            >
              {isAuthenticated ? "Zur Übersicht" : "Kostenlos starten"}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/70 pt-4 text-xs font-heading text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Für Bewerbungen in Deutschland und Österreich</span>
          <span>Premium folgt später. Der kostenlose Einstieg ist schon heute sinnvoll nutzbar.</span>
        </div>
      </div>
    </footer>
  );
}
