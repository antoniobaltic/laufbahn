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
    label: "Kostenloser Einstieg",
    value: "10 Bewerbungen",
    description: "Genug, um Laufbahn im echten Alltag zu testen.",
  },
  {
    label: "Import bereit",
    value: "Link, PDF, DOCX",
    description: "Stellen und Unterlagen lassen sich ohne Umwege übernehmen.",
  },
  {
    label: "Dokumente mitdenken",
    value: "Varianten & Verlauf",
    description: "Lebensläufe und Anschreiben wachsen mit deinen Bewerbungen mit.",
  },
];

export const marketingFeatureSpotlights: MarketingFeatureSpotlight[] = [
  {
    kicker: "Ruhe zuerst",
    title: "Du siehst sofort, was gerade wirklich wichtig ist.",
    description:
      "Laufbahn beginnt nicht mit einem Dashboard für Nerds, sondern mit einem ruhigen Überblick. Offene Bewerbungen, Fristen und Gespräche sind da, ohne dass du sie suchen musst.",
    bullets: [
      "Ein klarer erster Blick statt fünf offener Tabellen",
      "Erinnerungen dort, wo sie sinnvoll sind",
      "Mehr Tiefe erst dann, wenn du sie brauchst",
    ],
    accent: "orange",
  },
  {
    kicker: "Jede Bewerbung komplett",
    title: "Notizen, Kontakte, Gespräche und Unterlagen bleiben beisammen.",
    description:
      "Wenn du eine Bewerbung öffnest, ist alles da: was du schon geschickt hast, mit wem du gesprochen hast und was als Nächstes passieren sollte.",
    bullets: [
      "Kontakte und Gesprächsdetails direkt im Kontext",
      "Fixe Dokumentversionen pro Bewerbung",
      "Ein Verlauf, der den Prozess ehrlich erzählt",
    ],
    accent: "blue",
  },
  {
    kicker: "Dokumente, die mitwachsen",
    title: "Lebensläufe und Anschreiben werden nicht mehr zu Dateichaos.",
    description:
      "Aus einer soliden Basis entstehen Varianten für unterschiedliche Rollen. Jede verwendete Fassung bleibt nachvollziehbar, ohne dass die Oberfläche technisch wirkt.",
    bullets: [
      "Markdown unter der Haube, ruhige Schreibansicht vorne",
      "Varianten aus einer Basis ableiten",
      "Genaue Fassung je Bewerbung fixieren",
    ],
    accent: "green",
  },
];

export const marketingWorkflowSteps: MarketingWorkflowStep[] = [
  {
    step: "01",
    title: "Stelle merken oder importieren",
    description:
      "Link einfügen, Text übernehmen oder den Job einfach merken. Laufbahn zieht schon beim Einstieg die wichtigen Infos an einen ruhigen Ort.",
  },
  {
    step: "02",
    title: "Bewerbung sauber begleiten",
    description:
      "Status, Fristen, Kontakte und Dokumente bleiben bei dieser einen Bewerbung, statt sich über Notizen, Mail und Downloads zu verteilen.",
  },
  {
    step: "03",
    title: "Gespräche vorbereitet führen",
    description:
      "Wenn ein Termin näher rückt, liegen Zeitpunkt, Kontext und Vorbereitung schon dort, wo du sie brauchst.",
  },
];

export const premiumFeatureItems: PremiumFeatureItem[] = [
  {
    title: "Unbegrenzt Bewerbungen",
    description:
      "Für längere Bewerbungsphasen oder mehrere Suchrichtungen fällt der kostenlose Rahmen weg.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Die volle Dokument-Bibliothek",
    description:
      "Mehr Varianten, längerer Versionsverlauf und noch entspannteres Arbeiten mit mehreren Bewerbungsrichtungen.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Tiefere Auswertung",
    description:
      "Mehr Zusammenhänge zwischen Status, Rückmeldungen, Dokumenten und deiner tatsächlichen Arbeitsweise.",
    note: "Zum Start von Premium geplant",
  },
  {
    title: "Neue Komfortfunktionen zuerst",
    description:
      "Künftige Integrationen wie E-Mail-Anbindung sollen zuerst dort landen, wo Menschen dauerhaft intensiver mit Laufbahn arbeiten.",
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
      "Für alle, die ihre Bewerbungssuche endlich an einen klaren Ort holen wollen.",
    features: [
      "Übersicht, Erinnerungen und Bewerbungsdetails",
      "Stellenlink-Import und ruhige Detailansicht",
      "Dokumente, Notizen, Kontakte und Gespräche im Kontext",
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
      "Für Menschen, die länger suchen, mehrere Richtungen parallel fahren oder ihre Unterlagen wirklich systematisch pflegen.",
    features: [
      "Unbegrenzt Bewerbungen",
      "Mehr Tiefe in Dokumenten, Varianten und Verlauf",
      "Mehr Auswertung und kommende Komfortfunktionen zuerst",
    ],
    footnote:
      "Die Bezahlfreischaltung ist noch nicht live. Die Struktur ist bewusst schon vorbereitet.",
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
    free: "Für einzelne Grundlagen",
    premium: "Für mehrere Richtungen und tiefere Varianten",
  },
  {
    feature: "Auswertung",
    free: "Klarer Überblick",
    premium: "Tiefere Zusammenhänge",
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
      "Laufbahn ist bewusst für den DACH-Alltag geschrieben und gestaltet. Sprache, Copy und Importlogik orientieren sich an Stellenmärkten und Bewerbungsgewohnheiten in Deutschland und Österreich.",
  },
  {
    question: "Brauche ich Markdown-Kenntnisse für die Dokumente?",
    answer:
      "Nein. Die technische Grundlage ist Markdown, aber im Alltag schreibst du in einer ruhigen Oberfläche mit Vorschau. Der direkte Markdown-Modus bleibt eine erweiterte Option.",
  },
  {
    question: "Was bedeutet „Premium startet bald“?",
    answer:
      "Die Bezahlfreischaltung ist noch nicht live. Die Struktur und die geplanten Unterschiede sind schon vorbereitet, damit Laufbahn später nicht wie ein nachträglicher Bezahlaufsatz wirkt.",
  },
  {
    question: "Kann ich meine bisherigen Unterlagen und Stellen mitbringen?",
    answer:
      "Ja. Stellen lassen sich über Links und Texte übernehmen. Lebensläufe und Anschreiben kannst du als PDF oder DOCX einlesen und anschließend in Ruhe prüfen und weiterpflegen.",
  },
];
