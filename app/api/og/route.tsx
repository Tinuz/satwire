import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  let title = "SatWire – Crypto nieuws op één plek";
  let source = "satwire.app";
  let category = "general";
  let imageUrl: string | null = null;

  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("title, image_url, category, source:sources(name)")
      .eq("id", id)
      .single();

    if (data) {
      title = data.title ?? title;
      source = (data.source as { name?: string })?.name ?? source;
      category = data.category ?? category;
      imageUrl = data.image_url ?? null;
    }
  }

  // Truncate long titles
  const displayTitle = title.length > 80 ? title.slice(0, 77) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#0A0A0A",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image (blurred) */}
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.12,
              filter: "blur(8px)",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, transparent 60%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "48px",
            position: "relative",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "800",
                color: "#22C55E",
                textShadow: "0 0 30px rgba(34,197,94,0.6)",
              }}
            >
              Sat
            </span>
            <span style={{ fontSize: "32px", fontWeight: "800", color: "#FFFFFF" }}>
              Wire
            </span>
          </div>

          {/* Article title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Category pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "999px",
                padding: "6px 16px",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#22C55E",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {category}
              </span>
            </div>

            <p
              style={{
                fontSize: "40px",
                fontWeight: "700",
                color: "#FFFFFF",
                lineHeight: "1.25",
                margin: 0,
                maxWidth: "900px",
              }}
            >
              {displayTitle}
            </p>

            {/* Source */}
            <p
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.5)",
                margin: 0,
              }}
            >
              Via {source} · satwire.app
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
