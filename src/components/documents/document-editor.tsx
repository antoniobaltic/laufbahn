"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff, Heading2, Link2, List, PenSquare } from "lucide-react";
import { MarkdownPreview } from "@/components/documents/markdown-preview";
import { cn } from "@/lib/utils/cn";

type EditorLayout = "both" | "write" | "preview";

interface DocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  rawMode: boolean;
  onRawModeChange: (value: boolean) => void;
  className?: string;
  compact?: boolean;
}

const helperSnippets = [
  {
    label: "Überschrift",
    icon: Heading2,
    before: "## ",
    after: "",
    placeholder: "Abschnitt",
  },
  {
    label: "Liste",
    icon: List,
    before: "- ",
    after: "\n- ",
    placeholder: "Punkt",
  },
  {
    label: "Betonen",
    icon: PenSquare,
    before: "**",
    after: "**",
    placeholder: "Wichtiger Punkt",
  },
  {
    label: "Link",
    icon: Link2,
    before: "[",
    after: "](https://...)",
    placeholder: "Linktext",
  },
] as const;

export function DocumentEditor({
  value,
  onChange,
  rawMode,
  onRawModeChange,
  className,
  compact = false,
}: DocumentEditorProps) {
  const [layout, setLayout] = useState<EditorLayout>(compact ? "write" : "both");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const helperText = useMemo(
    () =>
      rawMode
        ? "Direkt im Markdown. Gut für Feinschliff oder sauberes Copy-Paste aus anderen Tools."
        : "Schreibe natürlich und nutze bei Bedarf Überschriften, Listen oder Links.",
    [rawMode]
  );

  const insertSnippet = (
    before: string,
    after: string,
    placeholder: string
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${value.endsWith("\n") ? "" : "\n"}${before}${placeholder}${after}`);
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const nextValue = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-white/78 px-4 py-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-heading font-medium text-dark">
              Schreiben & prüfen
            </p>
            <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
              {helperText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!compact && (
              <div className="flex items-center gap-1 rounded-full border border-border/80 bg-dark-50/60 p-1">
                <LayoutButton
                  active={layout === "write"}
                  onClick={() => setLayout("write")}
                  icon={<PenSquare size={14} />}
                  label="Editor"
                />
                <LayoutButton
                  active={layout === "both"}
                  onClick={() => setLayout("both")}
                  icon={<Eye size={14} />}
                  label="Beides"
                />
                <LayoutButton
                  active={layout === "preview"}
                  onClick={() => setLayout("preview")}
                  icon={<EyeOff size={14} />}
                  label="Vorschau"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => onRawModeChange(!rawMode)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-heading transition-colors",
                rawMode
                  ? "border-dark-200 bg-dark text-light"
                  : "border-border/80 bg-white/86 text-dark-500 hover:text-dark"
              )}
            >
              {rawMode ? "Markdown direkt" : "Erweiterter Modus"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {helperSnippets.map((snippet) => {
            const Icon = snippet.icon;

            return (
              <button
                key={snippet.label}
                type="button"
                onClick={() =>
                  insertSnippet(
                    snippet.before,
                    snippet.after,
                    snippet.placeholder
                  )
                }
                className="rounded-full border border-border/80 bg-white/88 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:border-dark-200 hover:text-dark"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon size={13} />
                  {snippet.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          !compact && layout === "both" && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        )}
      >
        {layout !== "preview" && (
          <div className="rounded-[28px] border border-border/80 bg-white/82 shadow-card">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                {rawMode ? "Markdown" : "Editor"}
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={cn(
                  "min-h-[26rem] w-full resize-y rounded-[22px] border border-border/80 bg-[#fbfaf6] px-4 py-4 text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
                  "focus:outline-none focus:ring-4 focus:ring-ring/12 focus:border-accent-orange",
                  rawMode
                    ? "font-mono text-[13px] leading-7"
                    : "font-body text-sm leading-8"
                )}
                spellCheck={!rawMode}
                placeholder={
                  rawMode
                    ? "# Dein Dokument\n\nSchreibe oder füge hier Markdown ein."
                    : "Schreibe hier deinen Lebenslauf oder dein Anschreiben."
                }
              />
            </div>
          </div>
        )}

        {layout !== "write" && (
          <div className="rounded-[28px] border border-border/80 bg-white/82 shadow-card">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Vorschau
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <MarkdownPreview markdown={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-heading transition-colors",
        active
          ? "bg-white text-dark shadow-card"
          : "text-dark-500 hover:text-dark"
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
