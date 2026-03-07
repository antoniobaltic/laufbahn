import { notFound } from "next/navigation";
import {
  getApplicationActivities,
  getApplicationById,
  getApplicationContacts,
  getApplicationDocuments,
} from "@/actions/applications";
import { ApplicationDetailView } from "@/components/application/application-detail-view";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  const [activities, contacts, documents] = await Promise.all([
    getApplicationActivities(id),
    getApplicationContacts(id),
    getApplicationDocuments(id),
  ]);

  return (
    <ApplicationDetailView
      application={application}
      activities={activities}
      contacts={contacts}
      documents={documents}
    />
  );
}
