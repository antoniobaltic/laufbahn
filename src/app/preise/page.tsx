import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingFaqList } from "@/components/marketing/faq-list";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import {
  PricingComparisonTable,
  PricingPlanCard,
} from "@/components/marketing/pricing-cards";
import {
  marketingFaqItems,
  premiumFeatureItems,
  pricingComparisonRows,
  pricingPlans,
} from "@/lib/marketing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Preise | Laufbahn",
  description:
    "Starte kostenlos mit Laufbahn. Premium folgt später mit mehr Raum für längere Bewerbungsphasen, tiefere Unterlagenpflege und mehr Überblick.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="app-frame min-h-screen bg-background">
      <MarketingHeader isAuthenticated={Boolean(user)} active="pricing" />

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(320px,0.72fr)] lg:gap-10 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/78 px-3 py-1.5 text-[11px] font-heading uppercase tracking-[0.14em] text-accent-orange">
              <Sparkles size={12} />
              Klare Preise ohne Add-ons
            </div>

            <h1 className="mt-6 text-4xl font-heading font-semibold leading-[1.02] tracking-tight text-dark sm:text-5xl lg:text-[4rem]">
              Ein fairer kostenloser Start und später ein Premium, das wirklich Mehrwert bringt.
            </h1>

            <p className="mt-6 max-w-xl text-lg font-body leading-relaxed text-dark-500 sm:text-[1.15rem]">
              Laufbahn soll dir schon kostenlos im Alltag helfen. Premium schaltet
              später mehr Tiefe frei, statt die Grundlagen künstlich knapp zu halten.
            </p>
          </div>

          <div className="surface-panel rounded-[34px] p-5 sm:p-6">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Aktueller Stand
            </p>
            <h2 className="mt-3 text-2xl font-heading font-semibold text-dark">
              Premium ist vorbereitet, aber noch nicht freigeschaltet.
            </h2>
            <p className="mt-4 text-sm font-body leading-relaxed text-dark-500 sm:text-[15px]">
              Die Preisstruktur, die geplanten Unterschiede und die passenden
              Oberflächen stehen schon. Die eigentliche Freischaltung folgt im
              nächsten Ausbauschritt.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[24px] border border-border/80 bg-white/84 px-4 py-4">
                <p className="text-sm font-heading font-medium text-dark">
                  Kostenlos
                </p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  Sofort nutzbar für den echten Bewerbungsalltag.
                </p>
              </div>
              <div className="rounded-[24px] border border-orange-200/80 bg-orange-50/74 px-4 py-4">
                <p className="text-sm font-heading font-medium text-dark">Premium</p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  Startet später mit mehr Raum für längere Suchphasen, tiefere
                  Dokumentarbeit und stärkere Auswertung.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                ctaHref={user ? "/board" : "/registrieren"}
                ctaLabel={user ? "Zur Übersicht" : "Kostenlos starten"}
              />
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-white/58">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Vergleich
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Was kostenlos schon kann und was Premium später erweitert.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Die Unterschiede sind bewusst einfach gehalten. Keine Add-ons, keine
                verwirrenden Pakete und keine künstlich komplizierte Matrix.
              </p>
            </div>

            <div className="mt-8">
              <PricingComparisonTable rows={pricingComparisonRows} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="max-w-xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-accent-orange">
                Was Premium freischalten soll
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Mehr Raum für längere Suchphasen, Varianten und spätere Komfortfunktionen.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Premium soll dann sinnvoll werden, wenn Laufbahn nicht nur dein
                Überblick, sondern dein dauerhaftes Zuhause für Bewerbungen wird.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {premiumFeatureItems.map((item) => (
                <div key={item.title} className="surface-card rounded-[30px] p-5 sm:p-6">
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
                    {item.note}
                  </p>
                  <h3 className="mt-4 text-xl font-heading font-semibold text-dark">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500 sm:text-[15px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-white/58">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Häufige Fragen zu Preisen und Einstieg.
              </h2>
            </div>

            <div className="mt-8">
              <MarketingFaqList items={marketingFaqItems} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="section-shell overflow-hidden rounded-[40px] border border-border/80 bg-dark px-5 py-8 text-light shadow-floating sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.24),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(106,155,204,0.18),transparent_20%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-white/62">
                  Loslegen
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-white sm:text-[2.25rem]">
                  Du musst nicht auf Premium warten, um heute schon ruhiger zu arbeiten.
                </h2>
                <p className="mt-4 text-base font-body leading-relaxed text-white/74">
                  Starte kostenlos und bringe deine Bewerbungen schon jetzt an
                  einen klaren Ort. Alles Weitere kann später sinnvoll mitwachsen.
                </p>
              </div>

              <Link
                href={user ? "/board" : "/registrieren"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-card-hover"
              >
                {user ? "Zur Übersicht" : "Kostenlos starten"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter isAuthenticated={Boolean(user)} />
    </div>
  );
}
