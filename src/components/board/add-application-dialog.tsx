"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Link2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createApplication } from "@/actions/applications";
import type { ScrapedJob } from "@/lib/scraper";
import type { Application, CreateApplicationInput } from "@/types/application";

interface AddApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (application: Application) => void;
  existingApplications?: Application[];
}

const EMPLOYMENT_TYPES = [
  { value: "Vollzeit", label: "Vollzeit" },
  { value: "Teilzeit", label: "Teilzeit" },
  { value: "Freelance", label: "Freelance" },
  { value: "Werkstudent", label: "Werkstudent" },
  { value: "Praktikum", label: "Praktikum" },
];

const REMOTE_OPTIONS = [
  { value: "Vor Ort", label: "Vor Ort" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Remote", label: "Remote" },
];

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function AddApplicationDialog({
  open,
  onClose,
  onCreated,
  existingApplications = [],
}: AddApplicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");
  const [scraperUrl, setScraperUrl] = useState("");
  const [scrapeError, setScrapeError] = useState("");
  const [duplicate, setDuplicate] = useState<Application | null>(null);
  const [fields, setFields] = useState({
    company_name: "",
    role_title: "",
    location: "",
    job_url: "",
    employment_type: "",
    remote_policy: "",
    deadline: "",
    salary_min: "",
    salary_max: "",
    notes: "",
    description: "",
  });

  const buildApplicationInput = (): CreateApplicationInput => ({
    company_name: fields.company_name.trim(),
    role_title: fields.role_title.trim(),
    location: fields.location.trim() || undefined,
    job_url: fields.job_url.trim() || undefined,
    salary_min: fields.salary_min ? Number(fields.salary_min) : undefined,
    salary_max: fields.salary_max ? Number(fields.salary_max) : undefined,
    employment_type: fields.employment_type || undefined,
    remote_policy: fields.remote_policy || undefined,
    deadline: fields.deadline || undefined,
    notes: fields.notes.trim() || undefined,
    description: fields.description.trim() || undefined,
  });

  const handleScrape = async () => {
    if (!scraperUrl.trim()) return;

    setScrapeError("");
    setScraping(true);

    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scraperUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        setScrapeError(err.error || "Fehler beim Lesen der Seite.");
        return;
      }

      const data: ScrapedJob = await res.json();

      setFields((prev) => ({
        ...prev,
        company_name: data.company_name || prev.company_name,
        role_title: data.role_title || prev.role_title,
        location: data.location || prev.location,
        job_url: scraperUrl,
        employment_type: data.employment_type || prev.employment_type,
        remote_policy: data.remote_policy || prev.remote_policy,
        salary_min: data.salary_min ? String(data.salary_min) : prev.salary_min,
        salary_max: data.salary_max ? String(data.salary_max) : prev.salary_max,
        description: data.description || prev.description,
      }));
    } catch {
      setScrapeError("Verbindungsfehler. Bitte manuell eingeben.");
    } finally {
      setScraping(false);
    }
  };

  const checkDuplicate = (companyName: string, roleTitle: string) => {
    if (!companyName || !roleTitle) return null;

    return (
      existingApplications.find(
        (app) =>
          normalizeText(app.company_name) === normalizeText(companyName) &&
          normalizeText(app.role_title) === normalizeText(roleTitle)
      ) || null
    );
  };

  const duplicateCandidate = checkDuplicate(fields.company_name, fields.role_title);

  const persistApplication = async () => {
    const application = await createApplication(buildApplicationInput());
    onCreated(application);
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (duplicateCandidate && duplicateCandidate.id !== duplicate?.id) {
      setDuplicate(duplicateCandidate);
      return;
    }

    setLoading(true);
    setDuplicate(null);

    try {
      await persistApplication();
    } catch {
      setError("Bewerbung konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFields({
      company_name: "",
      role_title: "",
      location: "",
      job_url: "",
      employment_type: "",
      remote_policy: "",
      deadline: "",
      salary_min: "",
      salary_max: "",
      notes: "",
      description: "",
    });
    setScraperUrl("");
    setScrapeError("");
    setError("");
    setDuplicate(null);
    onClose();
  };

  const setField =
    (key: keyof typeof fields) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-4xl">
      <DialogHeader onClose={handleClose}>Neue Bewerbung</DialogHeader>
      <DialogContent>
        <p className="mb-6 max-w-2xl text-sm font-body leading-relaxed text-dark-500">
          Starte mit den wichtigsten Angaben. Alles Weitere kannst du direkt
          jetzt ergänzen oder später in Ruhe nachtragen.
        </p>

        <div className="surface-muted mb-6 rounded-[24px] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-blue-600">
                Job-Link einfügen
              </p>
              <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                Wenn du einen Link zur Ausschreibung hast, füllen wir Rolle,
                Unternehmen und erste Angaben so weit wie möglich vor.
              </p>
            </div>

            <div className="flex-[1.35]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="url"
                    value={scraperUrl}
                    onChange={(e) => setScraperUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleScrape();
                      }
                    }}
                    placeholder="https://www.stepstone.de/job/..."
                    className="w-full rounded-xl border border-blue-200/80 bg-white/90 py-2.5 pl-9 pr-3 text-sm font-body text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300/20"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleScrape}
                  disabled={scraping || !scraperUrl.trim()}
                >
                  {scraping ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Übernehmen"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {scrapeError && (
            <p className="mt-3 text-xs font-heading text-orange-600">
              {scrapeError}
            </p>
          )}
        </div>

        {duplicateCandidate && !duplicate && (
          <div className="mb-5 rounded-[22px] border border-orange-200/80 bg-orange-50/75 p-4">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
              Hinweis
            </p>
            <p className="mt-2 text-sm font-heading font-medium text-dark">
              Ähnliche Bewerbung gefunden
            </p>
            <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
              Für <strong>{duplicateCandidate.company_name}</strong> und{" "}
              <strong>{duplicateCandidate.role_title}</strong> gibt es bereits
              einen Eintrag. Beim Speichern fragen wir sicherheitshalber noch
              einmal nach.
            </p>
          </div>
        )}

        {duplicate && (
          <div className="mb-5 flex gap-3 rounded-[22px] border border-orange-200/90 bg-orange-50/80 p-4">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-accent-orange"
            />
            <div className="flex-1">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-accent-orange">
                Bestätigung nötig
              </p>
              <p className="mt-2 text-sm font-heading font-medium text-dark">
                Mögliches Duplikat
              </p>
              <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                Du hast dich bereits bei <strong>{duplicate.company_name}</strong> als{" "}
                <strong>{duplicate.role_title}</strong> beworben. Möchtest du den
                neuen Eintrag trotzdem speichern?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={async () => {
                    setDuplicate(null);
                    setLoading(true);
                    try {
                      await persistApplication();
                    } catch {
                      setError("Fehler beim Speichern.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Trotzdem speichern
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDuplicate(null)}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}

        <form id="add-application-form" onSubmit={handleSubmit} className="space-y-6">
          <section className="surface-card rounded-[24px] p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Das brauchst du zum Start
              </p>
              <p className="mt-1 text-sm font-body text-dark-500">
                Unternehmen und Rolle reichen aus. Alles andere ist optional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="company_name"
                label="Unternehmen"
                value={fields.company_name}
                onChange={setField("company_name")}
                placeholder="z. B. Siemens"
                required
              />
              <Input
                id="role_title"
                label="Rolle"
                value={fields.role_title}
                onChange={setField("role_title")}
                placeholder="z. B. Product Manager"
                required
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="location"
                label="Standort"
                value={fields.location}
                onChange={setField("location")}
                placeholder="z. B. Wien oder München"
              />
              <Input
                id="job_url"
                label="Job-Link"
                type="url"
                value={fields.job_url}
                onChange={setField("job_url")}
                placeholder="https://..."
              />
            </div>
            <div className="mt-4">
              <Textarea
                id="notes"
                label="Erste Notiz"
                value={fields.notes}
                onChange={setField("notes")}
                placeholder="Was ist an der Stelle spannend? Was willst du später noch prüfen?"
                rows={4}
              />
            </div>
          </section>

          <details className="surface-card rounded-[24px] p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Weitere Angaben
                </p>
                <p className="mt-1 text-sm font-body text-dark-500">
                  Füge Arbeitsmodell, Frist, Gehalt oder eine Kurzbeschreibung hinzu.
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white/86 text-dark-500">
                <ChevronDown size={16} />
              </span>
            </summary>

            <div className="mt-5 space-y-6">
              <section>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Select
                    id="employment_type"
                    label="Anstellungsart"
                    placeholder="Wählen..."
                    options={EMPLOYMENT_TYPES}
                    value={fields.employment_type}
                    onChange={setField("employment_type")}
                  />
                  <Select
                    id="remote_policy"
                    label="Arbeitsort"
                    placeholder="Wählen..."
                    options={REMOTE_OPTIONS}
                    value={fields.remote_policy}
                    onChange={setField("remote_policy")}
                  />
                  <Input
                    id="deadline"
                    label="Bewerbungsfrist"
                    type="date"
                    value={fields.deadline}
                    onChange={setField("deadline")}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="salary_min"
                    label="Gehalt ab (EUR/Jahr)"
                    type="number"
                    value={fields.salary_min}
                    onChange={setField("salary_min")}
                    placeholder="z. B. 50000"
                  />
                  <Input
                    id="salary_max"
                    label="Gehalt bis (EUR/Jahr)"
                    type="number"
                    value={fields.salary_max}
                    onChange={setField("salary_max")}
                    placeholder="z. B. 70000"
                  />
                </div>
              </section>

              <section>
                <Textarea
                  id="description"
                  label="Kurzbeschreibung der Rolle"
                  value={fields.description}
                  onChange={setField("description")}
                  placeholder="Worum geht es in der Rolle? Welche Schwerpunkte springen ins Auge?"
                  rows={5}
                />
              </section>
            </div>
          </details>

          {error && (
            <p className="text-sm font-heading text-orange-600">{error}</p>
          )}
        </form>
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={handleClose} type="button">
          Abbrechen
        </Button>
        <Button type="submit" form="add-application-form" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Speichert...
            </>
          ) : (
            "Bewerbung speichern"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
