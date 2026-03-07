import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featureCards = [
  {
    icon: LayoutDashboard,
    title: "Board mit Fluss",
    description:
      "Von Gemerkt bis Angebot. Ein ruhiger Kanban-Workspace, der Fristen und Prioritäten sichtbar macht.",
    tone: "blue" as const,
  },
  {
    icon: FileText,
    title: "Kontext pro Bewerbung",
    description:
      "Dokumente, Kontakte, Notizen und Statuswechsel bleiben an einem Ort statt in Tabs und Ordnern verteilt.",
    tone: "orange" as const,
  },
  {
    icon: BarChart3,
    title: "Später ausbaubar",
    description:
      "Die Oberfläche bleibt bewusst ruhig, ist aber vorbereitet für Analytics, Erinnerungen und Premium-Workflows.",
    tone: "green" as const,
  },
];

export default function HomePage() {
  return (
    <div className="app-frame min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-orange shadow-card">
              <span className="text-sm font-heading font-bold text-white">L</span>
            </div>
            <div>
              <span className="block font-heading text-lg font-semibold tracking-tight text-dark">
                Laufbahn
              </span>
              <span className="block text-xs font-heading text-muted-foreground">
                Bewerbungen im Griff
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/anmelden"
              className="rounded-full px-3 py-2 text-sm font-heading font-medium text-dark-500 transition-colors hover:bg-white hover:text-dark"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="inline-flex items-center gap-2 rounded-full bg-accent-orange px-4 py-2.5 text-sm font-heading font-medium text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
            >
              Kostenlos starten
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <Badge variant="orange" className="mb-5">
              <Sparkles size={12} className="mr-1" />
              Ruhiger, warmer Bewerbungsworkspace
            </Badge>
            <h1 className="max-w-xl text-4xl font-heading font-semibold leading-[1.04] tracking-tight text-dark sm:text-5xl lg:text-[3.8rem]">
              Ein Bewerbungstracker, der sich nach Klarheit anfühlt.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-body leading-relaxed text-dark-500">
              Laufbahn bringt Board, Fristen, Kontakte, Notizen und Dokumente in
              eine Oberfläche, die bewusst ruhig bleibt. Retro-warm, präzise und
              angenehm zu benutzen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registrieren"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-orange px-6 py-3.5 text-base font-heading font-medium text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
              >
                Kostenlos starten
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/anmelden"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/78 px-6 py-3.5 text-base font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
              >
                Ich habe bereits ein Konto
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 text-sm font-heading text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-white/60 px-3 py-1.5">
                Kanban für DACH-Bewerbungen
              </span>
              <span className="rounded-full border border-border/80 bg-white/60 px-3 py-1.5">
                deutsche Oberfläche
              </span>
              <span className="rounded-full border border-border/80 bg-white/60 px-3 py-1.5">
                Fokus statt Tool-Chaos
              </span>
            </div>
          </div>

          <div className="section-shell surface-panel rounded-[32px] p-4 sm:p-5">
            <div className="rounded-[28px] border border-border/80 bg-[#fdfcf8] p-4 shadow-card sm:p-5">
              <div className="flex items-center justify-between gap-3 rounded-[22px] border border-border/70 bg-white/78 px-4 py-3">
                <div>
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    Heute im Fokus
                  </p>
                  <h2 className="mt-1 text-lg font-heading font-semibold text-dark">
                    Senior Product Designer
                  </h2>
                  <p className="text-sm font-body text-dark-500">
                    Nordlicht Systems · Wien · Hybrid
                  </p>
                </div>
                <div className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-heading font-medium text-accent-orange">
                  Beworben
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <PreviewMetric label="Aktiv" value="08" accent="text-accent-orange" />
                <PreviewMetric label="Gespräche" value="03" accent="text-accent-blue" />
                <PreviewMetric label="Fristen" value="02" accent="text-accent-green" />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="surface-card rounded-[24px] p-4">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-accent-blue" />
                    <h3 className="text-sm font-heading font-medium text-dark">
                      Board
                    </h3>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <PreviewColumn title="Gemerkt" count="04" tone="bg-blue-50" />
                    <PreviewColumn title="Beworben" count="03" tone="bg-orange-50" />
                    <PreviewColumn title="Im Gespräch" count="01" tone="bg-[#faf6e8]" />
                    <PreviewColumn title="Angebot" count="00" tone="bg-green-50" />
                  </div>
                </div>

                <div className="surface-card rounded-[24px] p-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-accent-green" />
                    <h3 className="text-sm font-heading font-medium text-dark">
                      Detailansicht
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    <PreviewTimeline title="Status geändert" text="Von Gemerkt zu Beworben" />
                    <PreviewTimeline title="Notiz gespeichert" text="Case Study vor Gespräch schärfen." />
                    <PreviewTimeline title="Kontakt hinzugefügt" text="Lisa Bauer · Recruiting Lead" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/80 bg-white/72">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Produktprinzip
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark">
                Klassisch, ruhig, reaktionsschnell.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Jede Fläche soll sofort verständlich sein, trotzdem hochwertig
                wirken und auf Desktop wie Mobile ohne Reibung funktionieren.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="surface-card interactive-lift rounded-[26px] p-6"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-50">
                      <Icon
                        size={22}
                        className={
                          feature.tone === "orange"
                            ? "text-accent-orange"
                            : feature.tone === "blue"
                              ? "text-accent-blue"
                              : "text-accent-green"
                        }
                      />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-dark">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-xs font-heading text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Laufbahn Beta</span>
        <span>Made with care for the DACH region</span>
      </footer>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="surface-card rounded-[22px] px-4 py-3">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-heading font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function PreviewColumn({
  title,
  count,
  tone,
}: {
  title: string;
  count: string;
  tone: string;
}) {
  return (
    <div className={`rounded-[20px] border border-border/70 ${tone} p-3`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-heading font-medium text-dark">{title}</span>
        <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-heading text-dark-500">
          {count}
        </span>
      </div>
      <div className="mt-3 rounded-[16px] border border-white/70 bg-white/70 px-3 py-2">
        <p className="text-xs font-heading text-muted-foreground">Letzte Aktivität</p>
        <p className="mt-1 text-sm font-body text-dark-500">Neue Reaktion in 2 Tagen</p>
      </div>
    </div>
  );
}

function PreviewTimeline({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-dark-50/80 px-4 py-3">
      <p className="text-sm font-heading font-medium text-dark">{title}</p>
      <p className="mt-1 text-sm font-body text-dark-500">{text}</p>
    </div>
  );
}
