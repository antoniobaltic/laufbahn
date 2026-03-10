import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarClock, FileText, LayoutDashboard } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Laufbahn | Klarer Kopf in der Jobsuche",
  description:
    "Laufbahn bringt Stellen, Gespräche, Fristen und Unterlagen an einen klaren Ort. Bewerbungen organisieren für Deutschland und Österreich.",
};

const features = [
  {
    icon: LayoutDashboard,
    title: "Übersicht",
    body: "Offene Bewerbungen, laufende Gespräche und Fristen auf einen Blick. Kein Suchen, kein Durcheinander.",
    accent: "orange" as const,
  },
  {
    icon: CalendarClock,
    title: "Bewerbung",
    body: "Kontakte, Gesprächsnotizen, Fristen und Unterlagen bleiben genau bei dieser einen Bewerbung.",
    accent: "blue" as const,
  },
  {
    icon: FileText,
    title: "Dokumente",
    body: "Lebensläufe und Anschreiben mit Varianten und Verlauf – fest verknüpft mit jeder Stelle.",
    accent: "green" as const,
  },
];

const steps = [
  {
    n: "01",
    title: "Stelle merken oder importieren",
    body: "Link einfügen, Text einfügen oder manuell anlegen. Die wichtigsten Infos landen direkt am richtigen Platz.",
  },
  {
    n: "02",
    title: "Bewerbung sauber begleiten",
    body: "Status, Fristen, Kontakte und Notizen in einer ruhigen Ansicht – statt verteilt über Mails und Tabs.",
  },
  {
    n: "03",
    title: "Vorbereitet ins Gespräch gehen",
    body: "Wenn ein Termin näher rückt, sind Zeitpunkt, Kontext und Vorbereitung schon bereit.",
  },
];

const accentClass = {
  orange: "bg-orange-50 text-accent-orange",
  blue: "bg-blue-50 text-accent-blue",
  green: "bg-green-50 text-accent-green",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/board");
  }

  return (
    <div className="app-frame min-h-screen bg-background">
      <MarketingHeader isAuthenticated={false} active="home" />

      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section aria-label="Hero" className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="marketing-track-stage rounded-[40px]">
            <div className="relative z-10 flex min-h-[62vh] flex-col px-8 py-8 sm:min-h-[70vh] sm:px-12 sm:py-10 lg:min-h-[78vh] lg:px-16 lg:py-12">

              {/* Eyebrow – top */}
              <div className="self-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 py-2 text-[11px] font-heading uppercase tracking-[0.14em] text-white/72 backdrop-blur-sm">
                  Für Deutschland und Österreich
                </span>
              </div>

              {/* Main content – pushed to bottom */}
              <div className="mt-auto max-w-2xl">
                <h1 className="text-5xl font-heading font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[5.25rem]">
                  Klarer Kopf.
                  <br />
                  <span className="text-accent-orange">Ruhige Jobsuche.</span>
                </h1>

                <p className="mt-6 max-w-[42ch] text-lg font-body leading-relaxed text-white/75 sm:text-[1.15rem]">
                  Laufbahn bringt alle Stellen, Gespräche, Fristen und Unterlagen
                  an einen Ort. Du weißt immer, was heute dran ist.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/registrieren"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-orange px-7 py-4 text-base font-heading font-medium text-white shadow-floating transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500"
                  >
                    Kostenlos starten
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/anmelden"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-heading font-medium text-white/84 transition-colors hover:bg-white/10"
                  >
                    Anmelden
                  </Link>
                </div>

                <p className="mt-5 text-sm font-body text-white/48">
                  Kostenlos · Bis zu 10 Bewerbungen · Keine Kreditkarte
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section
          id="warum"
          aria-label="Warum Laufbahn"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mb-10 max-w-xl">
            <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
              Warum Laufbahn
            </p>
            <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
              Weniger Chaos. Mehr Fokus.
            </h2>
            <p className="mt-3 text-base font-body leading-relaxed text-dark-500">
              Gute Werkzeuge schaffen Klarheit, nicht mehr Arbeit. Laufbahn
              beginnt ruhig und wird erst dann ausführlicher, wenn du es
              wirklich brauchst.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body, accent }) => (
              <div key={title} className="surface-card rounded-[32px] p-7">
                <div
                  className={[
                    "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[14px]",
                    accentClass[accent],
                  ].join(" ")}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-dark">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm font-body leading-relaxed text-dark-500">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section
          id="ablauf"
          aria-label="So läuft es ab"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="surface-panel section-shell rounded-[40px] p-6 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                  So läuft es ab
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
                  Von der ersten Stelle bis zum Gespräch.
                </h2>
              </div>
              <p className="max-w-xs text-sm font-body leading-relaxed text-dark-500 lg:text-right">
                Kein Einrichten. Kein Systemsprech. Einfach loslegen.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {steps.map(({ n, title, body }) => (
                <div key={n} className="surface-card rounded-[30px] p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark text-sm font-heading font-semibold text-light">
                    {n}
                  </div>
                  <h3 className="mt-5 text-xl font-heading font-semibold text-dark">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────── */}
        <section
          aria-label="Jetzt starten"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="section-shell overflow-hidden rounded-[40px] bg-dark px-8 py-12 shadow-floating sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(217,119,87,0.26),transparent_38%),radial-gradient(circle_at_84%_18%,rgba(106,155,204,0.18),transparent_24%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-heading font-semibold text-white sm:text-[2.25rem] lg:text-[2.5rem]">
                  Bring Ruhe in deine Jobsuche.
                </h2>
                <p className="mt-4 text-base font-body leading-relaxed text-white/68">
                  Laufbahn ist kostenlos. Keine Kreditkarte, kein Setup.
                  Einfach starten.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/registrieren"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-card-hover"
                >
                  Kostenlos starten
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/preise"
                  className="inline-flex items-center justify-center rounded-full border border-white/18 px-6 py-4 text-sm font-heading text-white/80 transition-colors hover:bg-white/10"
                >
                  Preise ansehen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter isAuthenticated={false} />
    </div>
  );
}
