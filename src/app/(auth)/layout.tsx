export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="surface-panel mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[38px] p-3 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.78fr)]">
        <div className="stage-visual hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-accent-orange shadow-[0_14px_28px_rgba(217,119,87,0.28)]">
                <span className="text-xl font-heading font-bold text-white">L</span>
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold text-white">
                  Laufbahn
                </h1>
                <p className="text-sm font-body text-white/72">
                  Bewerbungen entspannt organisieren
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-lg">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-white/62">
                Klarer Start
              </p>
              <h2 className="mt-4 text-4xl font-heading font-semibold leading-tight text-white">
                Eine Bewerbungssuche, die sich ruhig und hochwertig anfuehlt.
              </h2>
              <p className="mt-5 text-base font-body leading-relaxed text-white/76">
                Erst sehen, was wichtig ist. Dann tiefer gehen. Laufbahn hält Stand, Gespräche, Fristen, Kontakte und Unterlagen so zusammen, dass du dich nicht mehr durch verstreute Tools arbeiten musst.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-3">
            <div className="marketing-floating-card rounded-[28px] p-5">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
                Darauf kannst du dich verlassen
              </p>
              <ul className="mt-3 space-y-2 text-sm font-body leading-relaxed text-white/76">
                <li>ein ruhiger Überblick über alle laufenden Bewerbungen</li>
                <li>klare Detailseiten mit Verlauf, Kontakten und Unterlagen</li>
                <li>eine Oberfläche, die auch mobil ruhig bleibt</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[20px] bg-accent-orange shadow-card">
                <span className="text-xl font-heading font-bold text-white">L</span>
              </div>
              <h1 className="font-heading text-xl font-semibold text-dark">
                Laufbahn
              </h1>
              <p className="mt-1 text-sm font-body text-muted-foreground">
                Klar sehen, dann tiefer gehen
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
