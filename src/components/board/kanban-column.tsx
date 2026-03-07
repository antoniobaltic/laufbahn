"use client";

import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils/cn";
import { ColumnHeader } from "./column-header";
import { KanbanCard } from "./kanban-card";
import type { ApplicationOverview } from "@/types/application";
import type { ApplicationStatus } from "@/lib/utils/constants";
import { COLUMN_CONFIG } from "@/lib/utils/constants";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: ApplicationOverview[];
  onDeleteApplication?: (id: string) => void;
}

export function KanbanColumn({
  status,
  applications,
  onDeleteApplication,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className="flex w-[min(84vw,320px)] shrink-0 snap-start flex-col sm:w-[300px] xl:w-[320px]">
      {/* Color accent bar */}
      <div
        className="h-1.5 rounded-t-[24px]"
        style={{ backgroundColor: config.color }}
      />

      {/* Column container */}
      <div className="surface-card flex h-full flex-col rounded-b-[24px] border border-t-0 border-border/80 bg-white/78">
        <ColumnHeader
          title={config.title}
          count={applications.length}
          color={config.color}
        />

        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex-1 px-3 pb-3 pt-3 min-h-[180px] transition-[background-color,box-shadow] duration-200",
                snapshot.isDraggingOver &&
                  "rounded-b-[24px] bg-light-gray/55 shadow-[inset_0_0_0_1px_rgba(217,119,87,0.08)]"
              )}
            >
              {applications.map((app, index) => (
                <KanbanCard
                  key={app.id}
                  application={app}
                  index={index}
                  onDelete={onDeleteApplication}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
