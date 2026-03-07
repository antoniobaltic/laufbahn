"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PartyPopper, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfferCelebrationPayload {
  companyName?: string;
  roleTitle?: string;
}

interface OfferCelebrationContextValue {
  celebrateOffer: (payload?: OfferCelebrationPayload) => void;
}

interface OfferCelebrationState extends OfferCelebrationPayload {
  id: string;
}

const OfferCelebrationContext =
  createContext<OfferCelebrationContextValue | null>(null);

const PARTICLES = [
  { left: "10%", delay: "0ms", color: "var(--color-accent-orange)" },
  { left: "18%", delay: "120ms", color: "var(--color-accent-green)" },
  { left: "30%", delay: "200ms", color: "var(--color-accent-blue)" },
  { left: "42%", delay: "80ms", color: "var(--color-orange-300)" },
  { left: "56%", delay: "260ms", color: "var(--color-green-300)" },
  { left: "68%", delay: "160ms", color: "var(--color-blue-300)" },
  { left: "80%", delay: "240ms", color: "var(--color-accent-orange)" },
  { left: "90%", delay: "40ms", color: "var(--color-accent-green)" },
];

export function OfferCelebrationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [celebration, setCelebration] = useState<OfferCelebrationState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    setCelebration(null);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const celebrateOffer = useCallback((payload?: OfferCelebrationPayload) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setCelebration({
      id: crypto.randomUUID(),
      companyName: payload?.companyName,
      roleTitle: payload?.roleTitle,
    });

    timeoutRef.current = window.setTimeout(() => {
      setCelebration(null);
      timeoutRef.current = null;
    }, 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({ celebrateOffer }),
    [celebrateOffer]
  );
  const title = celebration?.companyName
    ? `${celebration.companyName}${celebration.roleTitle ? ` · ${celebration.roleTitle}` : ""}`
    : "Angebot erreicht";

  return (
    <OfferCelebrationContext.Provider value={contextValue}>
      {children}
      {celebration && (
        <div className="pointer-events-none fixed inset-x-4 top-24 z-[70] flex justify-center">
          <div className="offer-celebration-shell pointer-events-auto w-full max-w-[32rem] overflow-hidden rounded-[30px] border border-green-200/80 bg-[#fbfaf6]/96 p-5 shadow-floating backdrop-blur-xl">
            <div className="offer-celebration-glow" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.14em] text-green-700">
                  <PartyPopper size={13} />
                  Angebot erreicht
                </div>
                <h2 className="mt-3 text-xl font-heading font-semibold text-dark">
                  {title}
                </h2>
                <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                  Starker Moment. Kläre jetzt Konditionen, Startdatum und die nächsten
                  Gesprächstermine, solange alles frisch ist.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="green">Feierlich</Badge>
                  <Badge variant="default">Nächste Schritte sichern</Badge>
                  <Badge variant="muted">Verhandlungsbereit</Badge>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white hover:text-dark cursor-pointer"
                aria-label="Feier schließen"
              >
                <X size={15} />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-heading text-green-700">
              <Sparkles size={13} />
              Premium-Moment statt lauter Konfettiwand.
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
              {PARTICLES.map((particle, index) => (
                <span
                  key={`${celebration.id}-${index}`}
                  className="offer-confetti"
                  style={{
                    left: particle.left,
                    animationDelay: particle.delay,
                    backgroundColor: particle.color,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </OfferCelebrationContext.Provider>
  );
}

export function useOfferCelebration() {
  const context = useContext(OfferCelebrationContext);

  if (!context) {
    throw new Error(
      "useOfferCelebration must be used within OfferCelebrationProvider"
    );
  }

  return context;
}
