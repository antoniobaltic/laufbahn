import { redirect } from "next/navigation";
import { getNotificationReminders } from "@/actions/applications";
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

  const reminders = await getNotificationReminders();

  return (
    <AppShell userEmail={user.email} reminders={reminders}>
      {children}
    </AppShell>
  );
}
