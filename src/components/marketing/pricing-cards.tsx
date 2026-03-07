import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PricingComparisonRow, PricingPlan } from "@/lib/marketing";

interface PricingPlanCardProps {
  plan: PricingPlan;
  ctaHref: string;
  ctaLabel: string;
  compact?: boolean;
}

export function PricingPlanCard({
  plan,
  ctaHref,
  ctaLabel,
  compact = false,
}: PricingPlanCardProps) {
  return (
    <div
      className={cn(
        "section-shell rounded-[32px] border p-6 shadow-card transition-all duration-200",
        plan.featured
          ? "border-orange-200 bg-[linear-gradient(180deg,rgba(255,251,247,0.98)_0%,rgba(255,243,236,0.95)_100%)] shadow-card-hover"
          : "border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(252,251,248,0.94)_100%)]",
        compact ? "h-full" : "min-h-[32rem]"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              {plan.badge}
            </p>
            <h3 className="mt-3 text-2xl font-heading font-semibold text-dark">
              {plan.name}
            </h3>
          </div>
          {plan.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
              <Sparkles size={12} />
              Premium
            </span>
          )}
        </div>

        <div className="mt-6">
          <p className="text-4xl font-heading font-semibold text-dark">{plan.price}</p>
          <p className="mt-2 text-sm font-heading text-muted-foreground">
            {plan.priceHint}
          </p>
        </div>

        <p className="mt-5 text-sm font-body leading-relaxed text-dark-500">
          {plan.description}
        </p>

        <div className="mt-6 space-y-3">
          {plan.features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-[22px] border border-border/70 bg-white/72 px-4 py-3"
            >
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-dark text-light">
                <Check size={12} />
              </span>
              <span className="text-sm font-body leading-relaxed text-dark-500">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[22px] border border-border/70 bg-dark-50/62 px-4 py-4">
          <p className="text-sm font-body leading-relaxed text-dark-500">
            {plan.footnote}
          </p>
        </div>

        <div className="mt-6">
          <Link
            href={ctaHref}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-heading shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
              plan.featured
                ? "bg-accent-orange text-white hover:bg-orange-500"
                : "border border-border/80 bg-white text-dark hover:bg-white/92"
            )}
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface PricingComparisonTableProps {
  rows: PricingComparisonRow[];
}

export function PricingComparisonTable({
  rows,
}: PricingComparisonTableProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.feature}
            className="surface-card rounded-[26px] p-4"
          >
            <p className="text-sm font-heading font-semibold text-dark">{row.feature}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-border/70 bg-dark-50/62 px-3 py-3">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Kostenlos
                </p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  {row.free}
                </p>
              </div>
              <div className="rounded-[20px] border border-orange-200/70 bg-orange-50/62 px-3 py-3">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
                  Premium
                </p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  {row.premium}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[32px] border border-border/80 bg-white/82 shadow-card md:block">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)_minmax(160px,0.9fr)] border-b border-border/80 bg-dark-50/60 px-5 py-4 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground sm:px-6">
            <span>Leistung</span>
            <span>Kostenlos</span>
            <span>Premium</span>
          </div>

          <div className="divide-y divide-border/75">
            {rows.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)_minmax(160px,0.9fr)] gap-3 px-5 py-4 sm:px-6"
              >
                <p className="text-sm font-heading font-medium text-dark">{row.feature}</p>
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  {row.free}
                </p>
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  {row.premium}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
