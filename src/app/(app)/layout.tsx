import { redirect } from "next/navigation";
import { getNotificationReminders } from "@/actions/applications";
import { getCurrentProfile } from "@/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/anmelden");
  }

  const [reminders, profile] = await Promise.all([
    getNotificationReminders(),
    getCurrentProfile(),
  ]);

  return (
    <AppShell
      userEmail={user.email}
      userName={profile?.full_name || undefined}
      avatarColor={profile?.avatar_color}
      reminders={reminders}
    >
      {children}
    </AppShell>
  );
}
