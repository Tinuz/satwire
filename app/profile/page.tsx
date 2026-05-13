"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, LogOut, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";
import { AppShell } from "@/components/layout/AppShell";
import { AuthModal } from "@/components/common/AuthModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/lib/constants";
import { subscribeToPush, unsubscribeFromPush } from "@/components/common/ServiceWorkerRegistrar";
import { toast } from "sonner";
import type { Category } from "@/types";

const POPULAR_COINS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "AVAX", "DOT", "MATIC"];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { preferences, isAuthenticated, setAuthenticated, toggleFollowCategory, toggleFollowCoin, updatePreferences } = useUserStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync auth state on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(data.user?.id ?? null);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(null);
    toast.success("Je bent uitgelogd.");
    router.push("/feed");
  };

  const savePreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        followed_categories: preferences.followedCategories,
        followed_coins: preferences.followedCoins,
        push_enabled: preferences.pushEnabled,
      });

    if (error) toast.error("Kon voorkeuren niet opslaan.");
    else toast.success("Voorkeuren opgeslagen.");
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

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <User className="h-14 w-14 text-muted-foreground/30" />
          <p className="text-sm font-medium">Log in om je feed te personaliseren</p>
          <p className="text-xs text-muted-foreground">
            Volg coins en categorieën, sla artikelen op en ontvang push notificaties.
          </p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setAuthOpen(true)}
          >
            Inloggen
          </Button>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Mijn profiel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Uitloggen
          </Button>
        </div>

        <Separator className="bg-border/40" />

        {/* Followed categories */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Categorieën</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.value !== "all").map(({ label, value }) => {
              const active = preferences.followedCategories.includes(value as Category);
              return (
                <button
                  key={value}
                  onClick={() => toggleFollowCategory(value as Category)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card text-muted-foreground hover:border-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Followed coins */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Coins</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COINS.map((coin) => {
              const active = preferences.followedCoins.includes(coin);
              return (
                <button
                  key={coin}
                  onClick={() => toggleFollowCoin(coin)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-mono font-medium transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card text-muted-foreground hover:border-border"
                  }`}
                >
                  {coin}
                </button>
              );
            })}
          </div>
        </section>

        {/* Push notifications */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Notificaties</h2>
          <button
            onClick={async () => {
              const enabling = !preferences.pushEnabled;
              if (enabling) {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                  toast.error("Notificaties geblokkeerd. Wijzig dit in je browserinstellingen.");
                  return;
                }
                const ok = await subscribeToPush();
                if (!ok) {
                  toast.error("Kon niet subscriben op push notificaties.");
                  return;
                }
              } else {
                await unsubscribeFromPush();
              }
              updatePreferences({ pushEnabled: enabling });
            }}
            className={`flex items-center gap-3 w-full rounded-lg border p-4 text-sm transition-colors ${
              preferences.pushEnabled
                ? "border-primary/40 bg-primary/5"
                : "border-border/50 bg-card hover:border-border"
            }`}
          >
            {preferences.pushEnabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={preferences.pushEnabled ? "text-foreground" : "text-muted-foreground"}>
              {preferences.pushEnabled ? "Push notificaties aan" : "Push notificaties uit"}
            </span>
          </button>
        </section>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={savePreferences}
        >
          Voorkeuren opslaan
        </Button>
      </div>
    </AppShell>
  );
}
