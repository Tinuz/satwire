"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FREE_FEATURES = [
  "Onbeperkt crypto nieuws lezen",
  "Categoriefilters",
  "Zoekfunctie",
  "5 bookmarks",
  "Feed refresh elke 15 minuten",
];

const PREMIUM_FEATURES = [
  "Alles uit het gratis pakket",
  "Onbeperkte bookmarks",
  "Prijsalerts (tot 10 coins)",
  "Ad-free ervaring",
  "Feed refresh elke 5 minuten",
  "Geavanceerde filters (meerdere coins)",
  "Premium badge op profiel",
  "Prioriteitsondersteuning",
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, isPremium } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [annual, setAnnual] = useState(false);

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "";
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? "";

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push("/profile");
      return;
    }

    const priceId = annual ? annualPriceId : monthlyPriceId;
    if (!priceId) {
      toast.error("Stripe is nog niet geconfigureerd.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Kon geen checkout sessie aanmaken.");
      }
    } catch {
      toast.error("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Kies jouw plan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Altijd op de hoogte van crypto nieuws – gratis of premium.
          </p>

          {/* Annual/Monthly toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                !annual ? "bg-primary/15 text-primary" : "text-muted-foreground"
              )}
            >
              Maandelijks
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                annual ? "bg-primary/15 text-primary" : "text-muted-foreground"
              )}
            >
              Jaarlijks
              <Badge className="border-primary/40 bg-primary/10 text-primary text-[9px] py-0">
                -33%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-card/60 p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gratis
              </p>
              <p className="mt-2 text-3xl font-bold">€0</p>
              <p className="mt-1 text-xs text-muted-foreground">Voor altijd gratis</p>
            </div>

            <ul className="flex flex-1 flex-col gap-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  {f}
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full" disabled>
              Huidig plan
            </Button>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col rounded-xl border border-primary/40 bg-card/80 p-6 shadow-[0_0_40px_rgba(0,255,85,0.08)]">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="border-primary/50 bg-primary/20 text-primary px-3 text-[10px] uppercase tracking-wider font-bold shadow-[0_0_12px_rgba(0,255,85,0.3)]">
                <Zap className="mr-1 h-2.5 w-2.5" />
                Aanbevolen
              </Badge>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Premium
              </p>
              <p className="mt-2 text-3xl font-bold">
                {annual ? "€3,33" : "€4,99"}
                <span className="text-sm font-normal text-muted-foreground">/mnd</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {annual ? "Gefactureerd als €39,99/jaar" : "Maandelijks opzegbaar"}
              </p>
            </div>

            <ul className="flex flex-1 flex-col gap-2.5 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {isPremium() ? (
              <Button className="w-full bg-primary/20 text-primary border border-primary/40" disabled>
                <Check className="mr-2 h-4 w-4" />
                Je bent Premium
              </Button>
            ) : (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,85,0.3)]"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {isAuthenticated ? "Upgrade naar Premium" : "Log in om te upgraden"}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Veilig afrekenen via Stripe. Opzeggen kan altijd, direct effect na lopende periode.
        </p>
      </div>
    </AppShell>
  );
}
