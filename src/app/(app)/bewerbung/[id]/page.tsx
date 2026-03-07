import { notFound } from "next/navigation";
import { getApplicationWorkspace } from "@/actions/applications";
import { ApplicationDetailView } from "@/components/application/application-detail-view";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const workspace = await getApplicationWorkspace(id);

  if (!workspace?.application) {
    notFound();
  }

  return (
    <ApplicationDetailView
      application={workspace.application}
      activities={workspace.activities}
      contacts={workspace.contacts}
      documents={workspace.documents}
    />
  );
}
