import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/actions/profile";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/anmelden");
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
          Konto
        </p>
        <h1 className="mt-3 text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
          Profil & Einstellungen
        </h1>
        <p className="mt-2 text-sm font-body leading-relaxed text-dark-500 sm:text-base">
          Passe Name, Profilfarbe und Erinnerungen so an, dass Laufbahn für dich
          ruhiger und persönlicher funktioniert.
        </p>
      </div>

      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
