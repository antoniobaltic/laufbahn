import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Sofort verständlich",
    description:
      "Du siehst auf einen Blick, was offen ist, was als Nächstes ansteht und wo du nachfassen solltest.",
    tone: "text-accent-orange",
  },
  {
    icon: FileText,
    title: "Alles an einem Ort",
    description:
      "Notizen, Unterlagen, Kontakte und Termine bleiben bei der Bewerbung statt in verstreuten Tabs.",
    tone: "text-accent-blue",
  },
  {
    icon: CalendarClock,
    title: "Klarer nächster Schritt",
    description:
      "Fristen und Gespräche werden sichtbar, ohne dass sich die Oberfläche nach Arbeit anfühlt.",
    tone: "text-accent-green",
  },
];

const steps = [
  {
    kicker: "1",
    title: "Interessante Stellen merken",
    description:
      "Sammle relevante Jobs schnell und entscheide später in Ruhe, was wirklich passt.",
  },
  {
    kicker: "2",
    title: "Bewerbungen sauber begleiten",
    description:
      "Halte Status, Unterlagen und persönliche Notizen aktuell, ohne den Faden zu verlieren.",
  },
  {
    kicker: "3",
    title: "Gespräche vorbereitet führen",
    description:
      "Sobald ein Termin ansteht, liegen Ort, Zeitpunkt und Vorbereitung direkt bereit.",
  },
];

export default function HomePage() {
  return (
    <div className="app-frame min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/82 backdrop-blur-md md:backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-orange shadow-card">
              <span className="text-sm font-heading font-bold text-white">L</span>
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
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-center lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/78 px-3 py-1.5 text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
              <Sparkles size={12} />
              Für Bewerbungen in Deutschland und Österreich
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-heading font-semibold leading-[1.02] tracking-tight text-dark sm:text-5xl lg:text-[4rem]">
              Weniger Chaos. Mehr Klarheit bei jeder Bewerbung.
            </h1>

            <p className="mt-6 max-w-xl text-lg font-body leading-relaxed text-dark-500">
              Laufbahn hilft dir, offene Bewerbungen, Gespräche, Fristen und
              Unterlagen an einem Ort im Blick zu behalten. Einfach zu benutzen,
              aber stark genug für alles, was später dazukommt.
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
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/82 px-6 py-3.5 text-base font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
              >
                Ich habe schon ein Konto
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm font-heading text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-white/72 px-3 py-1.5">
                Fristen im Blick
              </span>
              <span className="rounded-full border border-border/80 bg-white/72 px-3 py-1.5">
                Gespräche vorbereitet
              </span>
              <span className="rounded-full border border-border/80 bg-white/72 px-3 py-1.5">
                Unterlagen griffbereit
              </span>
            </div>
          </div>

          <div className="section-shell surface-panel rounded-[34px] p-4 sm:p-5 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="surface-card rounded-[28px] p-5">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Heute wichtig
                </p>
                <h2 className="mt-2 text-xl font-heading font-semibold text-dark">
                  Drei Dinge brauchen gerade Aufmerksamkeit
                </h2>

                <div className="mt-5 space-y-3">
                  <PreviewTask
                    title="Bewerbung abschicken"
                    text="Produktdesigner bei Nordlicht Systems"
                    tone="orange"
                  />
                  <PreviewTask
                    title="Gespräch vorbereiten"
                    text="Intro-Call am Dienstag um 10:00 Uhr"
                    tone="blue"
                  />
                  <PreviewTask
                    title="Unterlagen prüfen"
                    text="Lebenslauf und Portfolio für Studio Berg"
                    tone="green"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="surface-card rounded-[28px] p-5">
                  <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    <Users size={13} className="text-accent-green" />
                    Nächste Schritte
                  </div>
                  <div className="mt-4 space-y-3">
                    <PreviewMetric label="Offen" value="8" />
                    <PreviewMetric label="Gespräche" value="3" />
                    <PreviewMetric label="Entscheidungen" value="2" />
                  </div>
                </div>

                <div className="surface-card rounded-[28px] p-5">
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    Pro Bewerbung
                  </p>
                  <div className="mt-4 space-y-3">
                    <PreviewRow title="Notizen" text="Warum passt die Rolle wirklich?" />
                    <PreviewRow title="Kontakt" text="Anna Berger · Recruiting" />
                    <PreviewRow title="Unterlagen" text="Lebenslauf v3 · Portfolio" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="defer-render border-y border-border/80 bg-white/72">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Warum es sich leicht anfühlt
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark">
                Klar aufgebaut, ohne leer zu wirken.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Laufbahn ist so gestaltet, dass der normale Alltag mit Bewerbungen
                ruhig bleibt. Mehr Tiefe ist da, wenn du sie brauchst, aber sie
                drängt sich nicht in den Vordergrund.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="surface-card interactive-lift rounded-[28px] p-6"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-50">
                      <Icon size={22} className={benefit.tone} />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-dark">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="defer-render mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="surface-panel section-shell rounded-[34px] p-5 sm:p-6 lg:p-7">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                So funktioniert es
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark">
                Vom ersten Link bis zum Angebot.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.kicker} className="surface-card rounded-[28px] p-6">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dark text-sm font-heading font-semibold text-light">
                    {step.kicker}
                  </div>
                  <h3 className="mt-4 text-lg font-heading font-semibold text-dark">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-xs font-heading text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Laufbahn</span>
        <span>Für Bewerbungen in Deutschland und Österreich</span>
      </footer>
    </div>
  );
}

function PreviewTask({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "orange" | "blue" | "green";
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-200 bg-orange-50/72"
      : tone === "blue"
        ? "border-blue-200 bg-blue-50/72"
        : "border-green-200 bg-green-50/78";

  return (
    <div className={`rounded-[22px] border p-4 ${toneClass}`}>
      <p className="text-sm font-heading font-semibold text-dark">{title}</p>
      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">{text}</p>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-border/80 bg-white/84 px-4 py-3">
      <span className="text-sm font-heading text-dark">{label}</span>
      <span className="text-xl font-heading font-semibold text-dark">{value}</span>
    </div>
  );
}

function PreviewRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-dark-50/76 px-4 py-3">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">{text}</p>
    </div>
  );
}
