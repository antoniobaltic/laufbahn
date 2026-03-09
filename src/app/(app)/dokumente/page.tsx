import Link from "next/link";
import { getDocumentsOverview } from "@/actions/documents";
import { DocumentsDashboard } from "@/components/documents/documents-dashboard";
import { PageHero } from "@/components/ui/page-hero";
import { cn } from "@/lib/utils/cn";

export default async function DocumentsPage() {
  const items = await getDocumentsOverview();

  return (
    <div className="space-y-6">
      <PageHero
        kicker="Dokumente"
        title="Lebensläufe und Anschreiben sollen sich leicht pflegen lassen, nicht nach Dateichaos anfühlen."
        description="Die Oberfläche bleibt ruhig. Darunter bleiben Grundlagen, Varianten und feste Fassungen pro Bewerbung weiterhin sauber nachvollziehbar."
        actions={
          <Link
            href="/board"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(228,210,191,0.82)] bg-white/88 px-5 py-3 text-sm font-heading font-medium text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_rgba(20,20,19,0.05)] transition-all duration-200",
              "hover:-translate-y-0.5 hover:bg-white"
            )}
          >
            Zur Übersicht
          </Link>
        }
        aside={
          <>
            <div className="metric-cloud rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Was hier wichtig ist
              </p>
              <p className="mt-3 text-lg font-heading font-semibold text-dark">
                Jede Bewerbung kann auf genau eine feste Fassung zeigen.
              </p>
            </div>
            <div className="metric-cloud rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Arbeitsweise
              </p>
              <p className="mt-3 text-lg font-heading font-semibold text-dark">
                Eine gute Grundlage vorne, Varianten erst dann, wenn du sie brauchst.
              </p>
            </div>
          </>
        }
      />

      <DocumentsDashboard items={items} />
    </div>
  );
}
