import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="surface-panel mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[38px] p-3 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.78fr)]">

        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div className="stage-visual hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-[20px] shadow-[0_14px_28px_rgba(217,119,87,0.28)]">
                <Image
                  src="/images/laufbahn-favicon2.png"
                  alt="Laufbahn"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="block font-heading text-2xl font-semibold text-white">
                  Laufbahn
                </span>
                <span className="block text-sm font-body text-white/72">
                  Klar durch die Jobsuche
                </span>
              </div>
            </Link>

            <div className="mt-16 max-w-lg">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-white/62">
                Klarer Start
              </p>
              <h2 className="mt-4 text-4xl font-heading font-semibold leading-tight text-white">
                Eine Jobsuche, die sich ruhiger anfühlt.
              </h2>
              <p className="mt-5 text-base font-body leading-relaxed text-white/76">
                Alle Bewerbungen, Gespräche und Unterlagen an einem Ort —
                statt verteilt über Mails, Tabs und Notizzettel.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <ul className="space-y-3">
              {[
                "Ruhiger Überblick über alle laufenden Bewerbungen",
                "Detailseiten mit Verlauf, Kontakten und Unterlagen",
                "Erinnerungen und nächste Schritte immer bereit",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-body leading-relaxed text-white/72">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-orange/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo — only shown when left panel is hidden */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="mb-3 h-12 w-12 overflow-hidden rounded-[20px] shadow-card">
                <Image
                  src="/images/laufbahn-favicon2.png"
                  alt="Laufbahn"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-heading text-xl font-semibold text-dark">
                Laufbahn
              </span>
              <span className="mt-1 text-sm font-body text-muted-foreground">
                Klar sehen, dann weiterkommen
              </span>
            </div>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
