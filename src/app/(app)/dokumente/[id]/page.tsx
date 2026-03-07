import { notFound } from "next/navigation";
import { getDocumentWorkspace } from "@/actions/documents";
import { DocumentWorkspace } from "@/components/documents/document-workspace";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  let workspace;

  try {
    workspace = await getDocumentWorkspace(id);
  } catch (error) {
    if (error instanceof Error && error.message === "Dokument nicht gefunden.") {
      notFound();
    }

    throw error;
  }

  return <DocumentWorkspace workspace={workspace} />;
}
