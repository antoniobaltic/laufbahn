import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Preise | Laufbahn",
  description:
    "Laufbahn ist kostenlos für bis zu 10 Bewerbungen. Premium folgt später mit mehr Raum für längere Suchphasen.",
};

const freeFeatures = [
  "Bis zu 10 Bewerbungen",
  "Volle Übersicht und Detailansicht",
  "Kontakte, Fristen und Gesprächsnotizen",
  "Dokumente mit eigenem Verlauf",
  "Auswertung und Erinnerungen",
];

const premiumFeatures = [
  "Alles aus Kostenlos",
  "Unbegrenzte Bewerbungen",
  "Mehr Dokumentvarianten",
  "Tiefere Auswertung",
  "Früher Zugang zu neuen Funktionen",
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/board" : "/registrieren";
  const ctaLabel = user ? "Zur Übersicht" : "Kostenlos starten";

  return (
    <div className="app-frame min-h-screen bg-background">
      <MarketingHeader isAuthenticated={Boolean(user)} active="pricing" />

      <main>
        {/* ── PLANS ─────────────────────────────────────────────── */}
        <section
          aria-label="Preise"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="surface-panel section-shell rounded-[40px] p-6 lg:p-10">
            <div className="max-w-xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Preise
              </p>
              <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
                Fang einfach an.
              </h1>
              <p className="mt-3 text-base font-body leading-relaxed text-dark-500">
                Kostenlos für den echten Alltag. Premium kommt später, wenn du mehr brauchst.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {/* Free plan */}
              <div className="surface-card flex flex-col rounded-[30px] p-7">
                <div>
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    Kostenlos
                  </p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-heading font-semibold text-dark">0 €</span>
                    <span className="mb-1 text-sm font-body text-dark-400">/ für immer</span>
                  </div>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                    Sofort nutzbar. Keine Kreditkarte, kein Setup.
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-body text-dark-500">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent-green" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={ctaHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-orange px-6 py-3.5 text-sm font-heading font-medium text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
                  >
                    {ctaLabel}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Premium plan */}
              <div className="flex flex-col rounded-[30px] border border-orange-200/60 bg-orange-50/50 p-7">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
                      Premium
                    </p>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-heading uppercase tracking-[0.1em] text-accent-orange">
                      Bald
                    </span>
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-heading font-semibold text-dark">—</span>
                  </div>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                    Für längere Suchphasen und mehr Tiefe. Preis folgt mit dem Launch.
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-body text-dark-400">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent-orange/50" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <div className="flex w-full items-center justify-center rounded-full border border-orange-200 bg-white/60 px-6 py-3.5 text-sm font-heading text-dark-400">
                    Noch nicht verfügbar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section
          aria-label="Jetzt starten"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="section-shell overflow-hidden rounded-[40px] bg-dark px-8 py-12 shadow-floating sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(217,119,87,0.26),transparent_38%),radial-gradient(circle_at_84%_18%,rgba(106,155,204,0.18),transparent_24%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-heading font-semibold text-white sm:text-[2.25rem] lg:text-[2.5rem]">
                  Du musst nicht auf Premium warten.
                </h2>
                <p className="mt-4 text-base font-body leading-relaxed text-white/68">
                  Starte kostenlos und bring deine Bewerbungen schon heute an einen ruhigen Ort.
                </p>
              </div>
              <Link
                href={ctaHref}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-card-hover"
              >
                {ctaLabel}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter isAuthenticated={Boolean(user)} />
    </div>
  );
}
