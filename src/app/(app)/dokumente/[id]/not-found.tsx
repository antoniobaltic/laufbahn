import Link from "next/link";
import { ArrowLeft, FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentNotFound() {
  return (
    <div className="surface-panel rounded-[32px] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dark-50 text-muted-foreground shadow-card">
          <FileX2 size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-heading font-semibold text-dark">
          Dokument nicht gefunden
        </h1>
        <p className="mt-3 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
          Diese Ansicht existiert nicht mehr oder gehört nicht zu deinem Konto.
        </p>
        <div className="mt-6">
          <Link href="/dokumente">
            <Button type="button" variant="secondary">
              <ArrowLeft size={14} />
              Zurück zu Dokumente
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
