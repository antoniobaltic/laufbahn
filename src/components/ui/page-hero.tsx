import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeroProps {
  kicker: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function PageHero({
  kicker,
  title,
  description,
  actions,
  aside,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "surface-stage rounded-[34px] px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        className
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:items-end">
        <div className="max-w-3xl">
          <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
            {kicker}
          </p>
          <h1 className="mt-3 text-3xl font-heading font-semibold leading-[1.02] text-dark sm:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-body leading-relaxed text-dark-500 sm:text-base">
            {description}
          </p>

          {actions ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>

        {aside ? <div className="grid gap-3 xl:justify-self-end xl:max-w-[32rem]">{aside}</div> : null}
      </div>
    </section>
  );
}
