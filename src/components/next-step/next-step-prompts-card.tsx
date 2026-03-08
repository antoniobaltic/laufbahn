import Link from "next/link";
import { ArrowRight, CalendarClock, MessageSquareMore, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { NextStepPrompt } from "@/types/next-step";

interface NextStepPromptsCardProps {
  prompts: NextStepPrompt[];
}

export function NextStepPromptsCard({ prompts }: NextStepPromptsCardProps) {
  if (prompts.length === 0) {
    return null;
  }

  const layoutClassName =
    prompts.length === 1
      ? "grid gap-3"
      : prompts.length === 2
        ? "grid gap-3 xl:grid-cols-2"
        : "grid gap-3 xl:grid-cols-3";

  return (
    <Card className="rounded-[32px]">
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            Als Nächstes sinnvoll
          </p>
          <h2 className="text-xl font-heading font-semibold text-dark">
            Ein klarer nächster Schritt statt zehn gleich lauter Signale
          </h2>
        </div>
      </CardHeader>
      <CardContent className={layoutClassName}>
        {prompts.map((prompt) => (
          <Link
            key={prompt.id}
            href={prompt.href}
            className={cn(
              "interactive-lift group flex flex-col gap-3 rounded-[24px] border border-border/80 bg-white/84 px-4 py-4 transition-all duration-200",
              prompts.length === 1 && "md:flex-row md:items-start md:justify-between",
              "hover:bg-white hover:shadow-card-hover"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px]",
                  getPromptTone(prompt.type)
                )}
              >
                {getPromptIcon(prompt.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-heading font-semibold text-dark">
                  {prompt.title}
                </p>
                <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                  {prompt.body}
                </p>
                {prompt.meta && (
                  <p className="mt-2 text-xs font-heading uppercase tracking-[0.08em] text-muted-foreground">
                    {prompt.meta}
                  </p>
                )}
              </div>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-heading uppercase tracking-[0.08em] text-accent-orange",
                prompts.length === 1 ? "md:self-center" : "sm:justify-end"
              )}
            >
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                {prompt.ctaLabel}
              </span>
              <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function getPromptIcon(type: NextStepPrompt["type"]) {
  if (type === "interview_prep") {
    return <PhoneCall size={16} className="text-accent-blue" />;
  }

  if (type === "deadline_review") {
    return <CalendarClock size={16} className="text-accent-orange" />;
  }

  return <MessageSquareMore size={16} className="text-accent-green" />;
}

function getPromptTone(type: NextStepPrompt["type"]) {
  if (type === "interview_prep") {
    return "bg-blue-50";
  }

  if (type === "deadline_review") {
    return "bg-orange-50";
  }

  return "bg-green-50";
}
