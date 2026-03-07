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

  return (
    <Card className="rounded-[28px]">
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            Als Nächstes sinnvoll
          </p>
          <h2 className="text-lg font-heading font-semibold text-dark">
            Laufbahn hilft dir beim nächsten Schritt
          </h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prompts.map((prompt) => (
          <Link
            key={prompt.id}
            href={prompt.href}
            className={cn(
              "interactive-lift flex flex-col gap-3 rounded-[22px] border border-border/80 bg-white/84 px-4 py-4 transition-all duration-200",
              "hover:bg-white hover:shadow-card-hover"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                  getPromptTone(prompt.type)
                )}
              >
                {getPromptIcon(prompt.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-heading font-semibold text-dark">
                  {prompt.title}
                </p>
                <p className="mt-1 text-sm font-body text-dark-500">{prompt.body}</p>
                {prompt.meta && (
                  <p className="mt-2 text-xs font-heading text-muted-foreground">
                    {prompt.meta}
                  </p>
                )}
              </div>
              <div className="hidden items-center gap-1 text-xs font-heading text-accent-orange sm:inline-flex">
                {prompt.ctaLabel}
                <ArrowRight size={12} />
              </div>
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
