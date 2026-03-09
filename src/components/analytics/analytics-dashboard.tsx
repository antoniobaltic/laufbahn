import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  MessageSquareMore,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatusPill } from "@/components/application/status-pill";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { cn } from "@/lib/utils/cn";
import { COLUMN_CONFIG } from "@/lib/utils/constants";
import { formatDateShort, relativeDate } from "@/lib/utils/dates";
import type {
  AnalyticsCoverageMetric,
  AnalyticsFunnelStep,
  AnalyticsMonthlyMomentumPoint,
  AnalyticsRecentMovementItem,
  AnalyticsSnapshot,
  AnalyticsStatusBreakdownItem,
} from "@/types/analytics";
import type { ActivityType } from "@/types/activity";

interface AnalyticsDashboardProps {
  snapshot: AnalyticsSnapshot;
}

export function AnalyticsDashboard({ snapshot }: AnalyticsDashboardProps) {
  const {
    totalApplications,
    activeApplications,
    interviewCount,
    offerCount,
    responseRate,
    offerRate,
    activityLast30Days,
    reminderCount,
    upcomingDeadlines,
    upcomingInterviews,
    pendingFollowUps,
    statusBreakdown,
    funnel,
    monthlyMomentum,
    workspaceCoverage,
    recentMovement,
  } = snapshot;

  if (totalApplications === 0) {
    return (
      <div className="space-y-6">
        <AnalyticsHero
          title="Auswertung"
          description="Sobald Bewerbungen angelegt sind, zeigt dir diese Seite, wo Rückmeldungen kommen und was gerade Aufmerksamkeit braucht."
        />
        <div className="surface-panel rounded-[32px] px-4">
          <EmptyState
            icon={<BarChart3 size={40} />}
            title="Noch keine Auswertung verfügbar"
            description="Lege zuerst ein paar Bewerbungen an. Dann zeigt dir diese Seite, wo Rückmeldungen kommen und was gerade Aufmerksamkeit braucht."
            action={
              <Link
                href="/board"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2 text-sm font-heading font-medium text-white transition-colors duration-150",
                  "hover:bg-orange-500"
                )}
              >
                Zur Übersicht
                <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsHero
        title="Auswertung"
        description="Sieh auf einen Blick, wie viele Bewerbungen aktiv sind, wo Rückmeldungen kommen und was als Nächstes wichtig ist."
        activeApplications={activeApplications}
        reminderCount={reminderCount}
        responseRate={responseRate}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={<BriefcaseBusiness size={15} className="text-accent-orange" />}
          label="Aktive Bewerbungen"
          value={String(activeApplications)}
          helper={`${totalApplications} insgesamt`}
          tone="orange"
        />
        <MetricCard
          icon={<TrendingUp size={15} className="text-accent-blue" />}
          label="Rückmeldungen"
          value={`${responseRate}%`}
          helper={`${interviewCount} Gespräche · ${offerCount} Angebote`}
          tone="blue"
        />
        <MetricCard
          icon={<CalendarClock size={15} className="text-dark-500" />}
          label="Wichtig jetzt"
          value={String(reminderCount)}
          helper={`${upcomingDeadlines} Fristen · ${upcomingInterviews} Gespräche · ${pendingFollowUps} Nachfassaktionen`}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="surface-card rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Überblick
              </p>
              <h2 className="mt-2 text-xl font-heading font-semibold text-dark">
                Wie sich deine Bewerbungen entwickeln
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-body leading-relaxed text-dark-500">
                Hier siehst du, wie weit deine Bewerbungen im Schnitt kommen und
                an welcher Stelle am meisten Bewegung entsteht.
              </p>
            </div>
            <Badge variant="default">{offerRate}% mit Angebot</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {statusBreakdown
              .filter((item) => item.count > 0)
              .map((item) => (
                <StatusCountPill key={item.status} item={item} />
              ))}
          </div>

          <div className="mt-6 grid gap-3">
            {funnel.map((step, index) => (
              <FunnelRow key={step.id} step={step} index={index} />
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-accent-orange" />
            <h2 className="text-xl font-heading font-semibold text-dark">
              Was jetzt wichtig ist
            </h2>
          </div>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            Diese Hinweise sollen dir Arbeit abnehmen, nicht neue Komplexität schaffen.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SignalTile
              label="Fristen"
              value={String(upcomingDeadlines)}
              helper="Bewerbungen mit enger Frist."
              tone="orange"
            />
            <SignalTile
              label="Gespräche"
              value={String(upcomingInterviews)}
              helper="Termine, die Vorbereitung brauchen."
              tone="blue"
            />
            <SignalTile
              label="Nachfassen"
              value={String(pendingFollowUps)}
              helper={`${activityLast30Days} Änderungen in den letzten 30 Tagen`}
              tone="green"
            />
          </div>

          <div className="mt-6 rounded-[24px] border border-border/80 bg-dark-50/72 p-4">
            <div className="flex items-center gap-2 text-sm font-heading text-dark">
              <Target size={14} className="text-accent-green" />
              Kurz gelesen
            </div>
            <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
              {pendingFollowUps > 0
                ? `${pendingFollowUps} Bewerbungen warten auf ein Nachfassen. Das ist gerade der schnellste Hebel.`
                : upcomingInterviews > 0
                  ? "Als Nächstes zählen gute Vorbereitung und klare Gesprächsnotizen mehr als neue Bewerbungen."
                  : "Im Moment wirkt alles ruhig. Nutze die Zeit für bessere Unterlagen oder neue passende Stellen."}
            </p>
          </div>
        </div>
      </div>

      <div className="defer-render grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="surface-card rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Rückblick
              </p>
              <h2 className="mt-2 text-xl font-heading font-semibold text-dark">
                Die letzten sechs Monate
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-heading text-muted-foreground">
              <LegendDot label="Gemerkt" color="var(--color-accent-blue)" />
              <LegendDot label="Beworben" color="var(--color-accent-orange)" />
              <LegendDot label="Gespräch" color="var(--color-status-gespraech)" />
              <LegendDot label="Angebot" color="var(--color-accent-green)" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {monthlyMomentum.map((point) => (
              <MomentumCard key={point.key} point={point} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-[30px] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-accent-orange" />
              <h2 className="text-xl font-heading font-semibold text-dark">
                Pflegestand
              </h2>
            </div>
            <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
              Diese Karten zeigen, wie vollständig deine Bewerbungen bisher gepflegt sind.
            </p>
            <div className="mt-5 grid gap-3">
              {workspaceCoverage.map((metric) => (
                <CoverageRow key={metric.id} metric={metric} />
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[30px] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MessageSquareMore size={15} className="text-accent-blue" />
              <h2 className="text-xl font-heading font-semibold text-dark">
                Zuletzt bewegt
              </h2>
            </div>
            {recentMovement.length > 0 ? (
              <div className="mt-5 space-y-3">
                {recentMovement.map((item) => (
                  <RecentMovementRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm font-body leading-relaxed text-dark-500">
                Noch keine Aktivitäten protokolliert. Sobald Stand, Notizen oder
                Unterlagen gepflegt werden, erscheinen die letzten Änderungen hier.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsHero({
  title,
  description,
  activeApplications,
  reminderCount,
  responseRate,
}: {
  title: string;
  description: string;
  activeApplications?: number;
  reminderCount?: number;
  responseRate?: number;
}) {
  return (
    <PageHero
      kicker="Auswertung"
      title={title}
      description={description}
      actions={
        <Link
          href="/board"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/82 px-4 py-2.5 text-sm font-heading font-medium text-dark transition-all duration-200",
            "hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
          )}
        >
          Zur Übersicht
          <ArrowRight size={16} />
        </Link>
      }
      aside={
        activeApplications !== undefined &&
        reminderCount !== undefined &&
        responseRate !== undefined ? (
          <>
            <div className="metric-cloud rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Aktiv
              </p>
              <p className="mt-3 text-2xl font-heading font-semibold text-dark">
                {activeApplications}
              </p>
              <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                Bewerbungen sind gerade noch offen.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="metric-cloud rounded-[24px] px-4 py-4">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Rückmeldungen
                </p>
                <p className="mt-3 text-2xl font-heading font-semibold text-dark">
                  {responseRate}%
                </p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  Gespräche oder Angebote im Verhältnis zu allen Bewerbungen.
                </p>
              </div>
              <div className="metric-cloud rounded-[24px] px-4 py-4">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Wichtig jetzt
                </p>
                <p className="mt-3 text-2xl font-heading font-semibold text-dark">
                  {reminderCount}
                </p>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  Hinweise brauchen aktuell Aufmerksamkeit.
                </p>
              </div>
            </div>
          </>
        ) : undefined
      }
    />
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  tone: "orange" | "blue" | "green" | "neutral";
}) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50/90"
      : tone === "blue"
        ? "bg-blue-50/90"
        : tone === "green"
          ? "bg-green-50/90"
          : "bg-dark-50/85";

  return (
    <div className="metric-cloud rounded-[26px] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <div className={cn("rounded-2xl p-2.5", toneClass)}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-heading font-semibold text-dark">{value}</p>
      <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">{helper}</p>
    </div>
  );
}

function StatusCountPill({ item }: { item: AnalyticsStatusBreakdownItem }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/82 px-2.5 py-1.5">
      <StatusPill status={item.status} />
      <span className="text-xs font-heading text-muted-foreground">
        {item.count} · {item.share}%
      </span>
    </div>
  );
}

function FunnelRow({
  step,
  index,
}: {
  step: AnalyticsFunnelStep;
  index: number;
}) {
  const stepStatus =
    step.id === "saved"
      ? "gemerkt"
      : step.id === "applied"
        ? "beworben"
        : step.id === "interview"
          ? "im_gespraech"
          : "angebot";
  const config = COLUMN_CONFIG[stepStatus];

  return (
    <div className="rounded-[24px] border border-border/80 bg-white/84 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-heading font-semibold"
            style={{ backgroundColor: config.bgLight, color: config.color }}
          >
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-dark">{step.label}</p>
            <p className="text-xs font-body text-dark-500">
              {step.count} Bewerbung{step.count === 1 ? "" : "en"}
            </p>
          </div>
        </div>
        {step.rateFromPrevious !== null && (
          <Badge variant="muted">{step.rateFromPrevious}% weitergekommen</Badge>
        )}
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-dark-50">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(step.share, step.count > 0 ? 8 : 0)}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}

function SignalTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "orange" | "blue" | "green";
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-200/80 bg-orange-50/70"
      : tone === "blue"
        ? "border-blue-200/80 bg-blue-50/70"
        : "border-green-200/80 bg-green-50/70";

  return (
    <div className={cn("rounded-[22px] border p-4", toneClass)}>
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-heading font-semibold text-dark">{value}</p>
      <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">{helper}</p>
    </div>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function MomentumCard({ point }: { point: AnalyticsMonthlyMomentumPoint }) {
  const rows = [
    {
      label: "Gemerkt",
      value: point.saved,
      color: "var(--color-accent-blue)",
    },
    {
      label: "Beworben",
      value: point.applied,
      color: "var(--color-accent-orange)",
    },
    {
      label: "Gespräche",
      value: point.interviews,
      color: "var(--color-status-gespraech)",
    },
    {
      label: "Angebote",
      value: point.offers,
      color: "var(--color-accent-green)",
    },
  ];
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="rounded-[24px] border border-border/80 bg-white/84 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-heading font-semibold capitalize text-dark">
          {point.label}
        </p>
        <Badge variant="muted">{point.applied} beworben</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-heading text-dark-500">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
            <div className="h-2 rounded-full bg-dark-50">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.value > 0 ? Math.max((row.value / maxValue) * 100, 10) : 0}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverageRow({ metric }: { metric: AnalyticsCoverageMetric }) {
  const icon =
    metric.id === "contacts"
      ? <Users size={14} className="text-accent-blue" />
      : metric.id === "documents"
        ? <FileText size={14} className="text-accent-orange" />
        : <Target size={14} className="text-accent-green" />;

  return (
    <div className="rounded-[22px] border border-border/80 bg-white/84 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-heading font-semibold text-dark">
            {icon}
            {metric.label}
          </div>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            {metric.helper}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-heading font-semibold text-dark">{metric.share}%</p>
          <p className="text-xs font-heading text-muted-foreground">{metric.count} Einträge</p>
        </div>
      </div>
    </div>
  );
}

function RecentMovementRow({ item }: { item: AnalyticsRecentMovementItem }) {
  return (
    <Link
      href={`/bewerbung/${item.applicationId}`}
      prefetch={false}
      className="group block rounded-[22px] border border-border/80 bg-white/84 p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-dark-200 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip type={item.activityType} />
            <p className="truncate text-sm font-heading font-semibold text-dark">
              {item.companyName}
            </p>
          </div>
          <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
            {item.title}
          </p>
          <p className="mt-2 truncate text-xs font-heading text-muted-foreground">
            {item.roleTitle}
          </p>
        </div>
        <div className="text-right text-xs font-heading text-muted-foreground">
          <p>{formatDateShort(item.createdAt)}</p>
          <p className="mt-1">{relativeDate(item.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}

function StatusChip({ type }: { type: ActivityType }) {
  if (type === "status_change") {
    return <Badge variant="blue">Status</Badge>;
  }

  if (type === "interview_scheduled") {
    return <Badge variant="green">Gespräch</Badge>;
  }

  if (type === "document_uploaded" || type === "document_updated") {
    return <Badge variant="muted">Dokument</Badge>;
  }

  return <Badge variant="default">Notiz</Badge>;
}
