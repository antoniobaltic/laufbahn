"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DropResult } from "@hello-pangea/dnd";
import { useOfferCelebration } from "@/components/celebration/offer-celebration-provider";
import type { ApplicationOverview } from "@/types/application";
import type { ApplicationStatus } from "@/lib/utils/constants";
import { COLUMN_ORDER } from "@/lib/utils/constants";
import { reorderApplications } from "@/actions/applications";

export function useKanban(initialApplications: ApplicationOverview[]) {
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { celebrateOffer } = useOfferCelebration();

  const getColumnApplications = useCallback(
    (status: ApplicationStatus) =>
      applications
        .filter((app) => app.status === status)
        .sort((a, b) => a.position_in_column - b.position_in_column),
    [applications]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const previousApplications = applications;

      const sourceStatus = source.droppableId as ApplicationStatus;
      const destStatus = destination.droppableId as ApplicationStatus;

      // Get copies of affected columns
      const sourceItems = getColumnApplications(sourceStatus).slice();
      const destItems =
        sourceStatus === destStatus
          ? sourceItems
          : getColumnApplications(destStatus).slice();

      // Remove from source
      const [movedItem] = sourceItems.splice(source.index, 1);
      if (!movedItem) return;

      // Insert into destination
      const updatedItem = { ...movedItem, status: destStatus };
      if (sourceStatus === destStatus) {
        sourceItems.splice(destination.index, 0, updatedItem);
      } else {
        destItems.splice(destination.index, 0, updatedItem);
      }

      // Build updates array
      const updates: {
        id: string;
        position_in_column: number;
        status: ApplicationStatus;
      }[] = [];

      const reindexedSource = sourceItems.map((item, idx) => {
        updates.push({
          id: item.id,
          position_in_column: idx,
          status: sourceStatus,
        });
        return { ...item, position_in_column: idx };
      });

      let reindexedDest = reindexedSource;
      if (sourceStatus !== destStatus) {
        reindexedDest = destItems.map((item, idx) => {
          updates.push({
            id: item.id,
            position_in_column: idx,
            status: destStatus,
          });
          return { ...item, position_in_column: idx };
        });
      }

      // Optimistic update
      setApplications((prev) => {
        const unchanged = prev.filter(
          (app) =>
            app.status !== sourceStatus &&
            (sourceStatus === destStatus || app.status !== destStatus)
        );
        return [
          ...unchanged,
          ...reindexedSource,
          ...(sourceStatus !== destStatus ? reindexedDest : []),
        ];
      });

      // Persist to server
      startTransition(async () => {
        try {
          await reorderApplications(updates);
          if (sourceStatus !== "angebot" && destStatus === "angebot") {
            celebrateOffer({
              companyName: movedItem.company_name,
              roleTitle: movedItem.role_title,
            });
          }
          router.refresh();
        } catch (error) {
          console.error("Failed to reorder:", error);
          setApplications(previousApplications);
        }
      });
    },
    [applications, celebrateOffer, getColumnApplications, router]
  );

  const addApplication = useCallback((app: ApplicationOverview) => {
    setApplications((prev) => [...prev, app]);
  }, []);

  const removeApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }, []);

  return {
    applications,
    getColumnApplications,
    handleDragEnd,
    addApplication,
    removeApplication,
    isPending,
    columns: COLUMN_ORDER,
  };
}
