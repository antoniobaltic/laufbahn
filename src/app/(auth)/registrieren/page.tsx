import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/board");
  }

  return <SignUpForm />;
}
