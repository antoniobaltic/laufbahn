"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
  emptyLabel?: string;
}

export function MarkdownPreview({
  markdown,
  className,
  emptyLabel = "Noch kein Inhalt vorhanden.",
}: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return (
      <div
        className={cn(
          "rounded-[24px] border border-dashed border-border/80 bg-dark-50/58 px-5 py-6 text-sm font-body leading-relaxed text-muted-foreground",
          className
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/75 bg-white/84 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
        className
      )}
    >
      <div className="space-y-4 text-sm font-body leading-7 text-dark-700">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-dark">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="pt-2 font-heading text-lg font-semibold text-dark">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="pt-1 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-dark-500">
                {children}
              </h3>
            ),
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul className="space-y-2 pl-5">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-2 pl-5">{children}</ol>,
            li: ({ children }) => <li className="marker:text-accent-orange">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-heading font-semibold text-dark">{children}</strong>
            ),
            em: ({ children }) => <em className="italic text-dark-500">{children}</em>,
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-heading text-accent-orange underline decoration-orange-200 underline-offset-4"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="rounded-r-[20px] border-l-4 border-accent-orange/40 bg-orange-50/45 px-4 py-3 text-dark-500">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="rounded bg-dark-50 px-1.5 py-0.5 font-mono text-[13px] text-dark">
                {children}
              </code>
            ),
            hr: () => <hr className="border-border/80" />,
          }}
        >
          {markdown}
        </Markdown>
      </div>
    </div>
  );
}
