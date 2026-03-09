"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FilePenLine, GitBranchPlus, Layers3 } from "lucide-react";
import { DocumentCreateDialog } from "@/components/documents/document-create-dialog";
import { useReferenceNow } from "@/components/providers/reference-now-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import {
  formatDocumentVersionLabel,
  getSourceDocumentTypeLabel,
  getSourceDocumentTypePluralLabel,
} from "@/lib/utils/documents";
import { relativeDate } from "@/lib/utils/dates";
import type { SourceDocumentOverviewItem } from "@/types/document";

interface DocumentsDashboardProps {
  items: SourceDocumentOverviewItem[];
}

export function DocumentsDashboard({ items }: DocumentsDashboardProps) {
  const referenceNow = useReferenceNow();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"alle" | "lebenslauf" | "anschreiben">(
    "alle"
  );
  const [advancedView, setAdvancedView] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variantSeedId, setVariantSeedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return items.filter((item) => {
      if (typeFilter !== "alle" && item.document.document_type !== typeFilter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return (
        item.document.title.toLowerCase().includes(needle) ||
        item.document.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
        item.currentVersion?.plain_text.toLowerCase().includes(needle)
      );
    });
  }, [items, search, typeFilter]);

  const groupedItems = useMemo(() => {
    return {
      lebenslauf: filteredItems.filter(
        (item) => item.document.document_type === "lebenslauf"
      ),
      anschreiben: filteredItems.filter(
        (item) => item.document.document_type === "anschreiben"
      ),
    };
  }, [filteredItems]);

  const baseOptions = useMemo(
    () =>
      items.flatMap((item) => {
        if (!item.currentVersion) {
          return [];
        }

        return [
          {
            documentId: item.document.id,
            title: item.document.title,
            documentType: item.document.document_type,
            tags: item.document.tags,
            currentVersionId: item.currentVersion.id,
            currentVersionNumber: item.currentVersion.version_number,
            currentVersionLabel: item.currentVersion.version_label,
            currentVersionMarkdown: item.currentVersion.markdown_content,
          },
        ];
      }),
    [items]
  );

  const variantFrom =
    baseOptions.find((option) => option.documentId === variantSeedId) || null;

  const totals = useMemo(
    () => ({
      documents: items.length,
      variants: items.filter((item) => item.document.parent_document_id).length,
      usedInApplications: items.reduce((sum, item) => sum + item.usageCount, 0),
    }),
    [items]
  );

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <OverviewCard
            label="Dokumente insgesamt"
            value={String(totals.documents)}
            hint="Lebensläufe und Anschreiben an einem Ort."
          />
          <OverviewCard
            label="Varianten"
            value={String(totals.variants)}
            hint="Abgeleitete Fassungen für andere Rollen oder Schwerpunkte."
          />
          <OverviewCard
            label="Mit Bewerbungen verknüpft"
            value={`${totals.usedInApplications}`}
            hint="So oft zeigen Bewerbungen bereits auf eine feste Fassung."
          />
        </div>

        <div className="surface-panel rounded-[34px] p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div>
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Bibliothek
              </p>
              <p className="mt-2 max-w-2xl text-sm font-body leading-relaxed text-dark-500">
                Suche nach Titeln, Tags oder Inhalt. Wechsle zwischen einer ruhigen Bibliothek und der Variantenansicht, wenn du Zusammenhänge sehen willst.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="segmented-control">
                <button
                  type="button"
                  data-active={!advancedView}
                  onClick={() => setAdvancedView(false)}
                  className="segmented-pill"
                >
                  Bibliothek
                </button>
                <button
                  type="button"
                  data-active={advancedView}
                  onClick={() => setAdvancedView(true)}
                  className="segmented-pill"
                >
                  Varianten
                </button>
              </div>
              <Button type="button" onClick={() => setDialogOpen(true)}>
                <FilePenLine size={15} />
                Dokument anlegen
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-[15rem] flex-1">
                <Input
                  id="documents-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Titel, Tag oder Inhalt durchsuchen"
                />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "alle", label: "Alle" },
                { value: "lebenslauf", label: "Lebensläufe" },
                { value: "anschreiben", label: "Anschreiben" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setTypeFilter(filter.value as "alle" | "lebenslauf" | "anschreiben")
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-heading transition-colors",
                    typeFilter === filter.value
                      ? "bg-dark text-light"
                      : "border border-border/80 bg-white/88 text-dark-500"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="space-y-6">
            {(["lebenslauf", "anschreiben"] as const).map((documentType) => {
              const itemsForType = groupedItems[documentType];

              if (!itemsForType.length) {
                return null;
              }

              return (
                <section key={documentType} className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                        Dokumente
                      </p>
                      <h2 className="mt-2 text-xl font-heading font-semibold text-dark">
                        {getSourceDocumentTypePluralLabel(documentType)}
                      </h2>
                    </div>
                    <div className="rounded-full border border-border/80 bg-white/82 px-3 py-2 text-xs font-heading text-muted-foreground shadow-card">
                      {itemsForType.length} Eintrag
                      {itemsForType.length === 1 ? "" : "e"}
                    </div>
                  </div>

                  {advancedView ? (
                    <DocumentTree
                      items={itemsForType}
                      onCreateVariant={(documentId) => {
                        setVariantSeedId(documentId);
                        setDialogOpen(true);
                      }}
                    />
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                      {itemsForType.map((item) => (
                        <DocumentCard
                          key={item.document.id}
                          item={item}
                          referenceNow={referenceNow}
                          onCreateVariant={(documentId) => {
                            setVariantSeedId(documentId);
                            setDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="surface-panel rounded-[32px] px-4">
            <EmptyState
              icon={<Layers3 size={40} />}
              title="Noch keine Dokumente"
              description="Lege hier deine Lebensläufe und Anschreiben an. Jede gespeicherte Fassung bleibt nachvollziehbar und kann später gezielt mit Bewerbungen verknüpft werden."
              action={
                <Button type="button" onClick={() => setDialogOpen(true)}>
                  <FilePenLine size={15} />
                  Erstes Dokument anlegen
                </Button>
              }
            />
          </div>
        )}
      </div>

      <DocumentCreateDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setVariantSeedId(null);
        }}
        baseOptions={baseOptions}
        variantFrom={variantFrom}
      />
    </>
  );
}

function OverviewCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="metric-cloud rounded-[28px]">
      <CardHeader className="pb-3">
        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-heading font-semibold text-dark">{value}</p>
        <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

function DocumentTree({
  items,
  onCreateVariant,
}: {
  items: SourceDocumentOverviewItem[];
  onCreateVariant: (documentId: string) => void;
}) {
  const itemIds = new Set(items.map((item) => item.document.id));
  const childrenByParent = items.reduce((map, item) => {
    const parentId =
      item.document.parent_document_id && itemIds.has(item.document.parent_document_id)
        ? item.document.parent_document_id
        : "root";
    const list = map.get(parentId) ?? [];
    list.push(item);
    map.set(parentId, list);
    return map;
  }, new Map<string, SourceDocumentOverviewItem[]>());

  return (
    <div className="space-y-3">
      {(childrenByParent.get("root") ?? []).map((item) => (
        <DocumentTreeNode
          key={item.document.id}
          item={item}
          depth={0}
          childrenByParent={childrenByParent}
          onCreateVariant={onCreateVariant}
        />
      ))}
    </div>
  );
}

function DocumentTreeNode({
  item,
  depth,
  childrenByParent,
  onCreateVariant,
}: {
  item: SourceDocumentOverviewItem;
  depth: number;
  childrenByParent: Map<string, SourceDocumentOverviewItem[]>;
  onCreateVariant: (documentId: string) => void;
}) {
  const referenceNow = useReferenceNow();
  const children = childrenByParent.get(item.document.id) ?? [];

  return (
    <div
      className={cn(
        "space-y-3 rounded-[28px] border border-border/80 bg-white/86 p-4 shadow-card",
        depth > 0 && "ml-4 sm:ml-8"
      )}
    >
      <DocumentCard
        item={item}
        referenceNow={referenceNow}
        onCreateVariant={onCreateVariant}
        compact
      />
      {children.length > 0 && (
        <div className="space-y-3 border-l border-border/80 pl-3 sm:pl-5">
          {children.map((child) => (
            <DocumentTreeNode
              key={child.document.id}
              item={child}
              depth={depth + 1}
              childrenByParent={childrenByParent}
              onCreateVariant={onCreateVariant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  item,
  referenceNow,
  onCreateVariant,
  compact = false,
}: {
  item: SourceDocumentOverviewItem;
  referenceNow: Date;
  onCreateVariant: (documentId: string) => void;
  compact?: boolean;
}) {
  const currentVersion = item.currentVersion;
  const documentRoleLabel = item.document.parent_document_id
    ? "Variante"
    : item.childCount > 0
      ? "Basisdokument"
      : "Eigenständig";

  return (
    <div
      className={cn(
        "rounded-[30px] border border-border/80 bg-white/86 p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        compact && "border-0 bg-transparent p-0 shadow-none hover:translate-y-0"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-heading font-semibold text-dark">
                {item.document.title}
              </h3>
              <Badge variant="muted">
                {getSourceDocumentTypeLabel(item.document.document_type)}
              </Badge>
              <Badge
                variant={item.document.parent_document_id ? "blue" : "muted"}
              >
                {documentRoleLabel}
              </Badge>
              {item.parentTitle && (
                <Badge variant="blue">Basis: {item.parentTitle}</Badge>
              )}
            </div>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              {currentVersion
                ? currentVersion.plain_text.slice(0, 160).trimEnd() +
                  (currentVersion.plain_text.length > 160 ? "…" : "")
                : "Noch keine Fassung gespeichert."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onCreateVariant(item.document.id)}
            >
              <GitBranchPlus size={14} />
              Variante
            </Button>
            <Link
              href={`/dokumente/${item.document.id}`}
              prefetch={false}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl bg-accent-orange px-3.5 py-2 text-sm font-heading text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-card-hover"
              )}
            >
              Öffnen
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentVersion && (
            <Badge variant="green">
              {formatDocumentVersionLabel(
                currentVersion.version_number,
                currentVersion.version_label
              )}
            </Badge>
          )}
          <Badge variant="muted">
            {item.usageCount} Bewerbung{item.usageCount === 1 ? "" : "en"}
          </Badge>
          {item.childCount > 0 && (
            <Badge variant="blue">
              {item.childCount} Variante{item.childCount === 1 ? "" : "n"}
            </Badge>
          )}
          <Badge variant="muted">
            Aktualisiert {relativeDate(item.document.updated_at, referenceNow)}
          </Badge>
        </div>

        {item.document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.document.tags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {item.recentApplications.length > 0 && (
          <div className="rounded-[22px] border border-border/80 bg-dark-50/62 px-4 py-4">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Zuletzt verwendet in
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/bewerbung/${application.id}`}
                  prefetch={false}
                  className="rounded-full border border-border/80 bg-white/88 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:text-dark"
                >
                  {application.company_name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
