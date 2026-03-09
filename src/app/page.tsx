import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  MoveRight,
  Sparkles,
  Target,
} from "lucide-react";
import { MarketingFaqList } from "@/components/marketing/faq-list";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingPlanCard } from "@/components/marketing/pricing-cards";
import { TrackShowcase } from "@/components/marketing/track-showcase";
import {
  marketingFaqItems,
  marketingFeatureSpotlights,
  marketingProofItems,
  marketingWorkflowSteps,
  premiumFeatureItems,
  pricingPlans,
} from "@/lib/marketing";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Laufbahn | Bewerbungen entspannt organisieren",
  description:
    "Organisiere Bewerbungen, Gespräche, Fristen und Unterlagen an einem klaren Ort. Laufbahn begleitet deine Jobsuche in Deutschland und Österreich.",
};

const accentStyles = {
  orange: {
    badge: "border-orange-200/80 bg-orange-50/78 text-accent-orange",
    panel: "border-orange-100/90 bg-[linear-gradient(180deg,rgba(255,248,244,0.98)_0%,rgba(255,243,236,0.94)_100%)]",
    bullet: "bg-accent-orange",
  },
  blue: {
    badge: "border-blue-200/80 bg-blue-50/78 text-accent-blue",
    panel: "border-blue-100/90 bg-[linear-gradient(180deg,rgba(246,249,253,0.98)_0%,rgba(240,245,250,0.94)_100%)]",
    bullet: "bg-accent-blue",
  },
  green: {
    badge: "border-green-200/80 bg-green-50/80 text-accent-green",
    panel: "border-green-100/90 bg-[linear-gradient(180deg,rgba(248,250,244,0.98)_0%,rgba(243,245,239,0.94)_100%)]",
    bullet: "bg-accent-green",
  },
} as const;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/board");
  }

  const primaryHref = "/registrieren";
  const primaryLabel = "Kostenlos starten";
  const freePlan = pricingPlans.find((plan) => plan.id === "free");
  const premiumPlan = pricingPlans.find((plan) => plan.id === "premium");

  if (!freePlan || !premiumPlan) {
    throw new Error("Marketing pricing data is incomplete.");
  }

  return (
    <div className="app-frame min-h-screen bg-background">
      <MarketingHeader isAuthenticated={false} active="home" />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-[4.5rem] pt-10 sm:px-6 sm:pb-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/78 px-3 py-1.5 text-[11px] font-heading uppercase tracking-[0.14em] text-accent-orange">
              <Sparkles size={12} />
              Für Bewerbungen in Deutschland und Österreich
            </div>

            <h1 className="mt-6 text-4xl font-heading font-semibold leading-[1.01] tracking-tight text-dark sm:text-5xl lg:text-[4.35rem]">
              Organisiere deine Bewerbungen, ohne den Kopf voll zu haben.
            </h1>

            <p className="mt-6 max-w-xl text-lg font-body leading-relaxed text-dark-500 sm:text-[1.15rem]">
              Laufbahn sammelt Stellen, Gespräche, Fristen und Unterlagen an einem
              klaren Ort. So weißt du schneller, was jetzt dran ist und was noch
              warten kann.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-orange px-6 py-3.5 text-base font-heading font-medium text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
              >
                {primaryLabel}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/preise"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-white/84 px-6 py-3.5 text-base font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
              >
                Preise & Pläne
                <MoveRight size={18} />
              </Link>
            </div>

            <p className="mt-4 text-sm font-body leading-relaxed text-dark-500">
              Kostenlos bis zu 10 Bewerbungen. Premium ist in Vorbereitung und
              erweitert später genau dort, wo mehr Tiefe hilft.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {marketingProofItems.map((item) => (
                <div
                  key={item.label}
                  className="surface-card rounded-[24px] px-4 py-4 sm:px-5"
                >
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-heading font-semibold text-dark">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <TrackShowcase />
        </section>

        <section id="warum" className="border-y border-border/70 bg-white/58">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:px-8 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Warum Laufbahn
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Weniger Durcheinander vorne. Mehr Tiefe, wenn du sie willst.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Gute Bewerbungssoftware nimmt dir Arbeit ab, statt neue zu machen.
                Darum beginnt Laufbahn mit einem ruhigen ersten Blick und wird
                erst dann ausführlicher, wenn du wirklich mehr brauchst.
              </p>

              <div className="mt-8 rounded-[30px] border border-border/80 bg-dark text-light shadow-floating">
                <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 sm:px-6">
                  <div>
                    <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/58">
                      Für jeden Tag
                    </p>
                    <p className="mt-3 text-2xl font-heading font-semibold text-white">
                      Ein klarer nächster Schritt statt lauter Funktionslisten.
                    </p>
                  </div>
                  <div className="grid gap-3 self-end">
                    <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3">
                      <p className="text-sm font-heading font-medium text-white">
                        Schnell verständlich
                      </p>
                      <p className="mt-1 text-sm font-body leading-relaxed text-white/72">
                        Schon im ersten Blick ist klar, worum du dich heute kümmern solltest.
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3">
                      <p className="text-sm font-heading font-medium text-white">
                        Für echte Bewerbungsphasen
                      </p>
                      <p className="mt-1 text-sm font-body leading-relaxed text-white/72">
                        Mehrere Richtungen, Varianten und Gespräche bleiben trotzdem ordentlich.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {marketingFeatureSpotlights.map((feature) => {
                const accent = accentStyles[feature.accent];

                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "surface-card rounded-[32px] border p-5 sm:p-6",
                      accent.panel
                    )}
                  >
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
                      <div>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1.5 text-[11px] font-heading uppercase tracking-[0.12em]",
                            accent.badge
                          )}
                        >
                          {feature.kicker}
                        </span>
                        <h3 className="mt-4 text-2xl font-heading font-semibold text-dark">
                          {feature.title}
                        </h3>
                        <p className="mt-3 text-sm font-body leading-relaxed text-dark-500 sm:text-[15px]">
                          {feature.description}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {feature.bullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="rounded-[22px] border border-white/60 bg-white/70 px-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                                  accent.bullet
                                )}
                              />
                              <span className="text-sm font-body leading-relaxed text-dark-500">
                                {bullet}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="ablauf"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="surface-panel section-shell rounded-[38px] p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                  So läuft es ab
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                  Von der ersten Stelle bis zur Entscheidung bleibt alles in einem
                  ruhigen Ablauf.
                </h2>
              </div>
              <div className="rounded-full border border-border/80 bg-white/80 px-4 py-2 text-sm font-heading text-dark-500 shadow-card">
                Kein Systemsprech. Einfach ein klarer Ablauf.
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {marketingWorkflowSteps.map((step) => (
                <div key={step.step} className="surface-card rounded-[30px] p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark text-sm font-heading font-semibold text-light">
                    {step.step}
                  </div>
                  <h3 className="mt-5 text-xl font-heading font-semibold text-dark">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-body leading-relaxed text-dark-500 sm:text-[15px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="premium"
          className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,248,244,0.72)_0%,rgba(250,249,245,0.9)_100%)]"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:px-8 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-accent-orange">
                Premium in Vorbereitung
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Für Menschen, die ihre Suche länger, breiter oder genauer begleiten
                wollen.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Premium ist schon mitgedacht, damit spätere Grenzen und
                Freischaltungen nicht wie ein Fremdkörper wirken. So bleibt der
                Einstieg ruhig, ehrlich und nachvollziehbar.
              </p>

              <div className="mt-8 rounded-[30px] border border-orange-200/90 bg-white/82 p-5 shadow-card sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-accent-orange">
                    <Target size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-heading font-semibold text-dark">
                      Schon heute sauber vorbereitet
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      Premium ist noch nicht freigeschaltet. Die spätere Struktur ist
                      aber bereits sichtbar, damit sich Laufbahn von Anfang an
                      konsistent anfühlt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/preise"
                  className="inline-flex items-center gap-2 rounded-full bg-dark px-5 py-3 text-sm font-heading font-medium text-light shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-dark-800 hover:shadow-card-hover"
                >
                  Preise ansehen
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {premiumFeatureItems.map((item) => (
                <div
                  key={item.title}
                  className="surface-card rounded-[30px] border-orange-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,247,242,0.94)_100%)] p-5 sm:p-6"
                >
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Preise
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Klare Pakete statt Kleingedrucktes.
              </h2>
              <p className="mt-4 text-base font-body leading-relaxed text-dark-500">
                Kostenlos soll wirklich nutzbar sein. Premium soll später echte
                Tiefe freischalten, nicht alltägliche Grundlagen wegnehmen.
              </p>
            </div>
            <Link
              href="/preise"
              className="inline-flex items-center gap-2 self-start rounded-full border border-border/80 bg-white/84 px-5 py-3 text-sm font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
            >
              Ganze Preisseite ansehen
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PricingPlanCard
              plan={freePlan}
              compact
              ctaHref="/registrieren"
              ctaLabel="Kostenlos starten"
            />
            <PricingPlanCard
              plan={premiumPlan}
              compact
              ctaHref="/preise"
              ctaLabel="Premium im Blick behalten"
            />
          </div>
        </section>

        <section id="faq" className="border-y border-border/70 bg-white/58">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.15rem]">
                Die wichtigsten Fragen, bevor du loslegst.
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
                  Ruhiger starten
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-white sm:text-[2.25rem]">
                  Bring Ruhe in deine Bewerbungssuche, bevor sie wieder unübersichtlich
                  wird.
                </h2>
                <p className="mt-4 text-base font-body leading-relaxed text-white/74">
                  Laufbahn ist für Menschen gebaut, die Bewerbungen ernst nehmen, aber
                  nicht in Listen, Dateinamen und verstreuten Notizen versinken wollen.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-heading font-medium text-dark shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-card-hover"
                >
                  Kostenlos starten
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/preise"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-6 py-3.5 text-sm font-heading font-medium text-white transition-colors hover:bg-white/12"
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
