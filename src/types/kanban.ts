import type { ApplicationStatus } from "@/lib/utils/constants";

export interface DragResult {
  applicationId: string;
  sourceStatus: ApplicationStatus;
  sourceIndex: number;
  destinationStatus: ApplicationStatus;
  destinationIndex: number;
}

export interface ColumnData {
  status: ApplicationStatus;
  title: string;
  color: string;
  bgLight: string;
  count: number;
}
