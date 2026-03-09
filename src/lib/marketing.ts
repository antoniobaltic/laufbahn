export interface MarketingProofItem {
  label: string;
  value: string;
  description: string;
}

export interface MarketingFeatureSpotlight {
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
  accent: "orange" | "blue" | "green";
}

export interface MarketingWorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface PremiumFeatureItem {
  title: string;
  description: string;
  note: string;
}

export interface PricingPlan {
  id: "free" | "premium";
  name: string;
  badge: string;
  price: string;
  priceHint: string;
  description: string;
  features: string[];
  footnote: string;
  featured?: boolean;
}

export interface PricingComparisonRow {
  feature: string;
  free: string;
  premium: string;
}

export interface MarketingFaqItem {
  question: string;
  answer: string;
}

export const marketingProofItems: MarketingProofItem[] = [
  {
    label: "Zum Reinkommen",
    value: "10 Bewerbungen",
    description: "Genug, um Laufbahn mitten im echten Bewerbungsalltag auszuprobieren.",
  },
  {
    label: "Schnell übernommen",
    value: "Link, PDF, DOCX",
    description: "Stellen und Unterlagen landen ohne Umwege an einem Ort.",
  },
  {
    label: "Unterlagen im Fluss",
    value: "Varianten & Verlauf",
    description: "Lebensläufe und Anschreiben entwickeln sich mit deinen Bewerbungen weiter.",
  },
];

export const marketingFeatureSpotlights: MarketingFeatureSpotlight[] = [
  {
    kicker: "Ruhe zuerst",
    title: "Du siehst sofort, was gerade wirklich wichtig ist.",
    description:
      "Laufbahn startet mit einem ruhigen Überblick. Offene Bewerbungen, Fristen und Gespräche liegen direkt vor dir, ohne Sucherei und ohne Tool-Gefühl.",
    bullets: [
      "Ein erster Blick, der sofort Orientierung gibt",
      "Hinweise genau dort, wo sie dir wirklich helfen",
      "Mehr Tiefe erst dann, wenn du sie willst",
    ],
    accent: "orange",
  },
  {
    kicker: "Jede Bewerbung komplett",
    title: "Alles zu einer Bewerbung bleibt an einem Ort.",
    description:
      "Wenn du eine Bewerbung öffnest, findest du sofort, was schon raus ist, wer beteiligt ist und was als Nächstes ansteht.",
    bullets: [
      "Kontakte und Gesprächsnotizen direkt im Zusammenhang",
      "Fest verknüpfte Unterlagen pro Bewerbung",
      "Ein Verlauf, der den Weg ehrlich zeigt",
    ],
    accent: "blue",
  },
  {
    kicker: "Dokumente, die mitwachsen",
    title: "Lebensläufe und Anschreiben bleiben endlich sortiert.",
    description:
      "Aus einer guten Basis entstehen passende Fassungen für verschiedene Rollen. Du behältst den Überblick, ohne dass es nach Dateiablage aussieht.",
    bullets: [
      "Ruhige Schreibansicht mit Vorschau",
      "Varianten aus einer starken Basis ableiten",
      "Verwendete Fassungen pro Bewerbung festhalten",
    ],
    accent: "green",
  },
];

export const marketingWorkflowSteps: MarketingWorkflowStep[] = [
  {
    step: "01",
    title: "Stelle merken oder importieren",
    description:
      "Füge einen Link ein, übernimm den Text oder merke dir die Stelle erst einmal. Die wichtigsten Infos landen direkt am richtigen Platz.",
  },
  {
    step: "02",
    title: "Bewerbung sauber begleiten",
    description:
      "Stand, Fristen, Kontakte und Unterlagen bleiben bei dieser einen Bewerbung, statt sich über Notizen, Mails und Downloads zu verteilen.",
  },
  {
    step: "03",
    title: "Gespräche vorbereitet führen",
    description:
      "Wenn ein Termin näher rückt, liegen Zeitpunkt, Kontext und Vorbereitung schon dort, wo du sie brauchst. Weniger Wühlen, mehr Ruhe im Kopf.",
  },
];

export const premiumFeatureItems: PremiumFeatureItem[] = [
  {
    title: "Unbegrenzt Bewerbungen",
    description:
      "Für längere Bewerbungsphasen oder mehrere Suchrichtungen fällt der kostenlose Rahmen einfach weg.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Mehr Raum für Unterlagen",
    description:
      "Mehr Varianten, längerer Verlauf und noch entspannteres Arbeiten mit mehreren Bewerbungsrichtungen.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Tiefere Auswertung",
    description:
      "Mehr Zusammenhänge zwischen Rückmeldungen, Unterlagen und deiner tatsächlichen Bewerbungsroutine.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Neue Komfortfunktionen zuerst",
    description:
      "Neue Hilfen sollen zuerst dort landen, wo Menschen länger und intensiver mit Laufbahn arbeiten.",
    note: "Sobald neue Integrationen bereitstehen",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Kostenlos",
    badge: "Für den Einstieg",
    price: "0 €",
    priceHint: "Bis zu 10 Bewerbungen",
    description:
      "Für alle, die ihre Bewerbungssuche endlich an einen klaren, ruhigen Ort holen wollen.",
    features: [
      "Übersicht, Erinnerungen und alle Bewerbungsdetails",
      "Stellenimport und klare Detailansichten",
      "Notizen, Kontakte, Gespräche und Unterlagen im Zusammenhang",
    ],
    footnote: "Ideal, um Laufbahn im echten Alltag auszuprobieren.",
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Startet bald",
    price: "Preis folgt",
    priceHint: "Ein klarer Tarif ohne Add-ons",
    description:
      "Für Menschen, die länger suchen, mehrere Richtungen parallel verfolgen oder ihre Unterlagen wirklich sorgfältig pflegen.",
    features: [
      "Unbegrenzt Bewerbungen",
      "Mehr Tiefe bei Unterlagen, Varianten und Verlauf",
      "Mehr Auswertung und neue Komfortfunktionen zuerst",
    ],
    footnote:
      "Premium ist noch nicht freigeschaltet. Die Struktur ist bewusst schon vorbereitet, damit später nichts aufgesetzt wirkt.",
    featured: true,
  },
];

export const pricingComparisonRows: PricingComparisonRow[] = [
  {
    feature: "Bewerbungen verwalten",
    free: "Bis zu 10",
    premium: "Unbegrenzt",
  },
  {
    feature: "Stellen importieren",
    free: "Enthalten",
    premium: "Enthalten",
  },
  {
    feature: "Fristen, Gespräche und Notizen",
    free: "Enthalten",
    premium: "Enthalten",
  },
  {
    feature: "Dokumenten-Bibliothek",
    free: "Für eine klare Basis",
    premium: "Für mehrere Richtungen und feinere Varianten",
  },
  {
    feature: "Auswertung",
    free: "Klarer Überblick",
    premium: "Mehr Muster und Zusammenhänge",
  },
  {
    feature: "Künftige Integrationen",
    free: "Später optional",
    premium: "Zuerst freigeschaltet",
  },
];

export const marketingFaqItems: MarketingFaqItem[] = [
  {
    question: "Ist Laufbahn nur für Deutschland und Österreich gedacht?",
    answer:
      "Vor allem ja. Laufbahn ist für den Bewerbungsalltag in Deutschland und Österreich geschrieben und gestaltet, damit Sprache, Abläufe und Beispiele wirklich passen.",
  },
  {
    question: "Muss ich mich für die Dokumente mit etwas Technischem auskennen?",
    answer:
      "Nein. Im Alltag schreibst du in einer ruhigen Oberfläche mit Vorschau. Eine direkte Textansicht gibt es nur dann, wenn du sie bewusst nutzen willst.",
  },
  {
    question: "Was bedeutet „Premium startet bald“?",
    answer:
      "Du kannst Laufbahn jetzt schon kostenlos nutzen. Premium wird später dort mehr Raum geben, wo längere Suchphasen und tiefere Dokumentarbeit es wirklich brauchen.",
  },
  {
    question: "Kann ich meine bisherigen Unterlagen und Stellen mitbringen?",
    answer:
      "Ja. Stellen lassen sich per Link oder Text übernehmen. Lebensläufe und Anschreiben kannst du als PDF oder DOCX einlesen, prüfen und danach in Ruhe weiterbearbeiten.",
  },
];
