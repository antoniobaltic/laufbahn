import type { ReactNode } from "react";
import {
  CalendarClock,
  FileText,
  MoveRight,
  Sparkles,
  Workflow,
} from "lucide-react";

const showcaseSignals = [
  {
    label: "Heute dran",
    title: "Nachfassen vormerken",
    text: "Vor 10 Tagen beworben · Produktmarketing bei Nordlicht Digital",
    tone: "orange",
  },
  {
    label: "Unterlagen",
    title: "Fassung fest verknüpft",
    text: "Lebenslauf Version 3 · Anschreiben Version 2",
    tone: "blue",
  },
  {
    label: "Gespräch",
    title: "Mittwoch, 10:00 Uhr",
    text: "Ort, Ansprechperson und Vorbereitung bleiben direkt an der Bewerbung.",
    tone: "green",
  },
] as const;

const panelCards = [
  {
    title: "Übersicht",
    body: "Offen, im Gespräch, entschieden. Ein ruhiger Blick statt zehn offener Tabs.",
  },
  {
    title: "Bewerbung",
    body: "Kontakte, Notizen, Unterlagen und Fristen bleiben bei genau diesem Eintrag.",
  },
  {
    title: "Dokumente",
    body: "Gute Grundlagen, passende Varianten und feste Fassungen je Bewerbung.",
  },
];

export function TrackShowcase() {
  return (
    <div className="marketing-track-stage min-h-[38rem] rounded-[40px] p-5 sm:p-6 lg:min-h-[42rem] lg:p-7">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-heading uppercase tracking-[0.14em] text-white/78">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-3 py-1.5">
            <Sparkles size={12} />
            Klarer Überblick
          </span>
          <span className="inline-flex items-center gap-2">
            <Workflow size={13} />
            Stellen · Gespräche · Unterlagen
          </span>
        </div>

        <div className="mt-8 grid flex-1 gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="flex flex-col gap-4">
            {showcaseSignals.map((signal, index) => (
              <div
                key={signal.title}
                className={`marketing-floating-card rounded-[30px] p-5 ${
                  index === 0
                    ? "lg:ml-0"
                    : index === 1
                      ? "lg:ml-8"
                      : "lg:ml-14"
                }`}
              >
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
                  {signal.label}
                </p>
                <h3 className="mt-3 text-xl font-heading font-semibold text-white">
                  {signal.title}
                </h3>
                <p className="mt-2 text-sm font-body leading-relaxed text-white/78">
                  {signal.text}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-heading text-white/68">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      signal.tone === "orange"
                        ? "bg-accent-orange"
                        : signal.tone === "blue"
                          ? "bg-accent-blue"
                          : "bg-accent-green"
                    }`}
                  />
                  Nächster Schritt ist sichtbar
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div className="rounded-[34px] border border-white/12 bg-[#151513]/68 p-6 shadow-floating backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
                    Der rote Faden
                  </p>
                  <h3 className="mt-3 text-2xl font-heading font-semibold text-white">
                    Ein Ort, der sich nach Bewerben anfühlt statt nach Verwaltung.
                  </h3>
                </div>
                <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-xs font-heading text-white/72">
                  Für DACH gemacht
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {panelCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-white/12 bg-white/9 px-4 py-4"
                  >
                    <p className="text-sm font-heading font-semibold text-white">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-white/72">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ShowcaseMetric
                icon={<MoveRight size={15} className="text-accent-orange" />}
                label="Nächster Schritt"
                value="klar"
              />
              <ShowcaseMetric
                icon={<CalendarClock size={15} className="text-accent-blue" />}
                label="Gespräche"
                value="bereit"
              />
              <ShowcaseMetric
                icon={<FileText size={15} className="text-accent-green" />}
                label="Unterlagen"
                value="geordnet"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="marketing-floating-card rounded-[26px] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-2xl font-heading font-semibold text-white">{value}</p>
    </div>
  );
}
