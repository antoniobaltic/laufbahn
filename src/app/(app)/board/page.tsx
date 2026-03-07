import { getApplications } from "@/actions/applications";
import { KanbanBoard } from "@/components/board/kanban-board";

export default async function BoardPage() {
  const applications = await getApplications();
  const boardKey =
    applications.length > 0
      ? applications
          .map((application) => `${application.id}:${application.updated_at}`)
          .join("|")
      : "empty";

  return <KanbanBoard key={boardKey} initialApplications={applications} />;
}
