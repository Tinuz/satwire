"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";
import { AppShell } from "@/components/layout/AppShell";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { NEWS_SOURCES } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isAuthenticated, setAuthenticated } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  const handleDeleteAccount = async () => {
    if (!confirm("Weet je zeker dat je je account wilt verwijderen? Alle data wordt permanent gewist en dit kan niet ongedaan worden gemaakt.")) return;

    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      setAuthenticated(null);
      toast.success("Je account is verwijderd.");
      router.push("/feed");
    } else {
      const { error } = await res.json().catch(() => ({ error: "Onbekende fout" }));
      toast.error(`Verwijdering mislukt: ${error}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(null);
    router.push("/feed");
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <h1 className="text-lg font-bold">Instellingen</h1>

        <Separator className="bg-border/40" />

        {/* Account */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Account</h2>
          {isAuthenticated && userEmail ? (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4">
              <div>
                <p className="text-sm font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Ingelogd</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                Uitloggen
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Niet ingelogd.</p>
          )}
        </section>

        {/* App info */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Over SatWire</h2>
          <div className="rounded-lg border border-border/50 bg-card p-4 text-xs text-muted-foreground space-y-1">
            <p>Versie 1.0.0</p>
            <p>Crypto nieuws vanuit alle bronnen – op één plek.</p>
          </div>
        </section>

        {/* Sources */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Nieuwsbronnen</h2>
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <ul className="space-y-1 text-xs text-muted-foreground">
              {NEWS_SOURCES.map((src) => (
                <li key={src} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                  {src}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Danger zone */}
        {isAuthenticated && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-destructive">Gevaarzone</h2>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Account verwijderen
            </Button>
          </section>
        )}
      </div>
    </AppShell>
  );
}
