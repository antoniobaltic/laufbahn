import type { ApplicationStatus } from "@/lib/utils/constants";
import type { ActivityType } from "@/types/activity";

export interface AnalyticsStatusBreakdownItem {
  status: ApplicationStatus;
  count: number;
  share: number;
}

export interface AnalyticsFunnelStep {
  id: "saved" | "applied" | "interview" | "offer";
  label: string;
  count: number;
  share: number;
  rateFromPrevious: number | null;
}

export interface AnalyticsMonthlyMomentumPoint {
  key: string;
  label: string;
  saved: number;
  applied: number;
  interviews: number;
  offers: number;
}

export interface AnalyticsCoverageMetric {
  id: "notes" | "deadlines" | "contacts" | "documents";
  label: string;
  count: number;
  share: number;
  helper: string;
}

export interface AnalyticsRecentMovementItem {
  id: string;
  applicationId: string;
  companyName: string;
  roleTitle: string;
  title: string;
  activityType: ActivityType;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  totalApplications: number;
  activeApplications: number;
  appliedApplications: number;
  interviewCount: number;
  offerCount: number;
  decisionsCount: number;
  responseRate: number;
  offerRate: number;
  averageDaysToInterview: number | null;
  averageDaysToOffer: number | null;
  activityLast30Days: number;
  reminderCount: number;
  upcomingDeadlines: number;
  upcomingInterviews: number;
  pendingFollowUps: number;
  statusBreakdown: AnalyticsStatusBreakdownItem[];
  funnel: AnalyticsFunnelStep[];
  monthlyMomentum: AnalyticsMonthlyMomentumPoint[];
  workspaceCoverage: AnalyticsCoverageMetric[];
  recentMovement: AnalyticsRecentMovementItem[];
}
