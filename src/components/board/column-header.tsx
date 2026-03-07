interface ColumnHeaderProps {
  title: string;
  count: number;
  color: string;
}

export function ColumnHeader({ title, count, color }: ColumnHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-heading font-semibold text-dark">
          {title}
        </h3>
        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
          Status
        </p>
      </div>
      <span className="ml-auto rounded-full border border-border/80 bg-white/82 px-2.5 py-1 text-[11px] font-heading font-medium text-dark-500">
        {count}
      </span>
    </div>
  );
}
