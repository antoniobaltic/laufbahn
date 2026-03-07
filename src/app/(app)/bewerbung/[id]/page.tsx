import { notFound } from "next/navigation";
import { getApplicationWorkspace } from "@/actions/applications";
import {
  getApplicationSourceDocuments,
  getDocumentPickerOptions,
} from "@/actions/documents";
import { ApplicationDetailView } from "@/components/application/application-detail-view";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const [workspace, linkedDocuments, documentPickerOptions] = await Promise.all([
    getApplicationWorkspace(id),
    getApplicationSourceDocuments(id),
    getDocumentPickerOptions(),
  ]);

  if (!workspace?.application) {
    notFound();
  }

  return (
    <ApplicationDetailView
      application={workspace.application}
      activities={workspace.activities}
      contacts={workspace.contacts}
      documents={workspace.documents}
      linkedDocuments={linkedDocuments}
      documentPickerOptions={documentPickerOptions}
    />
  );
}
