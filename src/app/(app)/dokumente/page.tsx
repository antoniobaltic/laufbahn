import { getDocumentsOverview } from "@/actions/documents";
import { DocumentsDashboard } from "@/components/documents/documents-dashboard";

export default async function DocumentsPage() {
  const items = await getDocumentsOverview();

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
          Dokumente
        </p>
        <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
          Lebensläufe und Anschreiben in Ruhe pflegen
        </h1>
        <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
          Halte deine Fassungen an einem Ort, starte Varianten aus einer soliden
          Basis und sieh jederzeit, welche Version bereits in einer Bewerbung
          steckt.
        </p>
      </div>

      <DocumentsDashboard items={items} />
    </div>
  );
}
