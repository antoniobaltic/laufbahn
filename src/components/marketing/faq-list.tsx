import { ChevronDown } from "lucide-react";
import type { MarketingFaqItem } from "@/lib/marketing";

interface MarketingFaqListProps {
  items: MarketingFaqItem[];
}

export function MarketingFaqList({ items }: MarketingFaqListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group surface-card rounded-[28px] p-5 sm:p-6"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
            <span className="pr-2 text-base font-heading font-medium text-dark sm:text-lg">
              {item.question}
            </span>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-dark-50/70 text-dark-500 transition-transform duration-200 group-open:rotate-180 group-open:text-dark">
              <ChevronDown size={18} />
            </span>
          </summary>
          <p className="mt-4 max-w-3xl text-sm font-body leading-relaxed text-dark-500 sm:text-[15px]">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
