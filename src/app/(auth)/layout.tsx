export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[34px] border border-white/70 bg-white/54 shadow-floating backdrop-blur-xl lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,0.78fr)]">
        <div className="section-shell hidden border-r border-border/70 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-accent-orange shadow-card">
                <span className="text-xl font-heading font-bold text-white">L</span>
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold text-dark">
                  Laufbahn
                </h1>
                <p className="text-sm font-body text-dark-500">
                  Bewerbungen entspannt organisieren
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-lg">
              <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
                Klarer Start
              </p>
              <h2 className="mt-4 text-4xl font-heading font-semibold leading-tight text-dark">
                Alles Wichtige zu jeder Bewerbung an einem Ort.
              </h2>
              <p className="mt-5 text-base font-body leading-relaxed text-dark-500">
                Halte Bewerbungen, Gespräche, Fristen, Kontakte und Unterlagen
                übersichtlich zusammen, ohne dich durch unnötige Komplexität zu
                arbeiten.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="surface-card rounded-[24px] p-5">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Darauf kannst du dich verlassen
              </p>
              <ul className="mt-3 space-y-2 text-sm font-body text-dark-500">
                <li>ein ruhiger Überblick über alle laufenden Bewerbungen</li>
                <li>Notizen, Kontakte und Unterlagen direkt bei jedem Eintrag</li>
                <li>eine Oberfläche, die auch auf dem Handy klar bleibt</li>
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
                Bewerbungen entspannt organisieren
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
