"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/board";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("E-Mail oder Passwort ist falsch.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="surface-stage rounded-[32px] p-6 sm:p-8">
      <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
        Willkommen zurück
      </p>
      <h2 className="mt-3 text-3xl font-heading font-semibold text-dark">
        Anmelden
      </h2>
      <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
        Geh direkt zurück zu offenen Bewerbungen, Gesprächen und allem, was als Nächstes ansteht.
      </p>

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <Input
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@beispiel.de"
          required
          autoComplete="email"
        />

        <Input
          id="password"
          label="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Dein Passwort"
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm font-heading text-orange-600">{error}</p>
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "Einen Moment..." : "Anmelden"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-body text-muted-foreground">
        Noch neu hier?{" "}
        <Link
          href="/registrieren"
          className="font-heading font-medium text-accent-orange hover:underline"
        >
          Konto erstellen
        </Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}
