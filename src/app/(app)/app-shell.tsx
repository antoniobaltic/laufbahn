"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OfferCelebrationProvider } from "@/components/celebration/offer-celebration-provider";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast";
import type { ReminderItem } from "@/types/reminder";
import type { AvatarColor } from "@/types/profile";

interface AppShellProps {
  userEmail?: string;
  userName?: string;
  avatarColor?: AvatarColor;
  reminders: ReminderItem[];
  children: React.ReactNode;
}

export function AppShell({
  userEmail,
  userName,
  avatarColor,
  reminders,
  children,
}: AppShellProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/anmelden");
    router.refresh();
  };

  return (
    <ToastProvider>
      <OfferCelebrationProvider>
        <div className="app-frame flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar
              userEmail={userEmail}
              userName={userName}
              avatarColor={avatarColor}
              reminders={reminders}
              onSignOut={handleSignOut}
            />
            <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
              <div className="mx-auto w-full max-w-[1520px] fade-in-up">
                {children}
              </div>
            </main>
          </div>
        </div>
      </OfferCelebrationProvider>
    </ToastProvider>
  );
}
