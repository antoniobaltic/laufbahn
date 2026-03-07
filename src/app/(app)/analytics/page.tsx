import { getAnalyticsSnapshot } from "@/actions/applications";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot();

  return <AnalyticsDashboard snapshot={snapshot} />;
}
