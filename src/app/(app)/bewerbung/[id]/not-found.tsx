import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

export default function ApplicationNotFound() {
  return (
    <div className="surface-panel rounded-[32px] px-4">
      <EmptyState
        icon={<SearchX size={40} />}
        title="Bewerbung nicht gefunden"
        description="Der Eintrag existiert nicht mehr oder gehört nicht zu deinem Konto."
        action={
          <Link
            href="/bewerbung"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2 text-sm font-heading font-medium text-white transition-colors duration-150",
              "hover:bg-orange-500"
            )}
          >
            <ArrowLeft size={16} />
            Zur Übersicht
          </Link>
        }
      />
    </div>
  );
}
