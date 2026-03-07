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
        "overflow-hidden rounded-[24px] border border-border/75 bg-white/84 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
        className
      )}
    >
      <div className="space-y-4 break-words text-sm font-body leading-7 text-dark-700">
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
            table: ({ children }) => (
              <div className="overflow-x-auto rounded-[20px] border border-border/80 bg-dark-50/45">
                <table className="min-w-full border-collapse text-left text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-white/80 font-heading text-xs uppercase tracking-[0.08em] text-dark-500">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="border-b border-border/80 px-4 py-3 font-heading font-medium">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-border/70 px-4 py-3 align-top last:border-b-0">
                {children}
              </td>
            ),
            pre: ({ children }) => (
              <pre className="overflow-x-auto rounded-[20px] bg-dark px-4 py-4 font-mono text-[13px] leading-6 text-light">
                {children}
              </pre>
            ),
            code: ({ children, className }) => (
              <code
                className={cn(
                  "font-mono text-[13px]",
                  className
                    ? "bg-transparent px-0 py-0 text-light"
                    : "rounded bg-dark-50 px-1.5 py-0.5 text-dark"
                )}
              >
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
