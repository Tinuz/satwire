import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import FeedClient from "./FeedClient";

export const metadata: Metadata = {
  title: "Feed – SatWire",
  description: "Lees het laatste crypto nieuws vanuit alle bronnen op één plek.",
};

export default function FeedPage() {
  return (
    <AppShell>
      <FeedClient />
    </AppShell>
  );
}
