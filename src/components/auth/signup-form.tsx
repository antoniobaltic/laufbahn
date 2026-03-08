"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="surface-stage rounded-[32px] p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="mb-2 text-2xl font-heading font-semibold text-dark">
          Fast geschafft!
        </h2>
        <p className="text-sm font-body leading-relaxed text-muted-foreground">
          Wir haben dir eine Bestätigungsmail geschickt. Öffne den Link darin,
          um dein Konto freizuschalten.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-stage rounded-[32px] p-6 sm:p-8">
      <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-muted-foreground">
        Neues Konto
      </p>
      <h2 className="mt-3 text-3xl font-heading font-semibold text-dark">
        Konto erstellen
      </h2>
      <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
        Lege dir in wenigen Minuten einen klaren Ort für Bewerbungen, Unterlagen und nächste Schritte an.
      </p>

      <form onSubmit={handleSignUp} className="mt-8 space-y-4">
        <Input
          id="fullName"
          label="Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Max Mustermann"
          required
          autoComplete="name"
        />

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
          placeholder="Mindestens 8 Zeichen"
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm font-heading text-orange-600">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Erstellt Konto..." : "Konto erstellen"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-body text-muted-foreground">
        Bereits ein Konto?{" "}
        <Link
          href="/anmelden"
          className="font-heading font-medium text-accent-orange hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </div>
  );
}
