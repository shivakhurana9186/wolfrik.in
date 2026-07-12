import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_IMAGE_HOSTS = new Set([
  "cdn.shopify.com",
  "cdn.shopifycdn.net",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const FETCH_TIMEOUT_MS = 8000;

function isAllowedImageUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (ALLOWED_IMAGE_HOSTS.has(host)) return true;
  // allow subdomains of shopify.com
  return host.endsWith(".shopify.com") || host.endsWith(".shopifycdn.net");
}

async function fetchAsDataUrl(url: string): Promise<string> {
  if (!isAllowedImageUrl(url)) {
    throw new Error("Image host not allowed");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "error" });
    if (!res.ok) throw new Error(`Failed to fetch reference image: ${res.status}`);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw new Error("Reference URL is not an image");
    }
    const len = Number(res.headers.get("content-length") || "0");
    if (len && len > MAX_IMAGE_BYTES) {
      throw new Error("Reference image too large");
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) {
      throw new Error("Reference image too large");
    }
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = btoa(binary);
    return `data:${contentType};base64,${b64}`;
  } finally {
    clearTimeout(timer);
  }
}

type Garment = { image: string; title: string; role: "top" | "bottom" | "full" };

export const Route = createFileRoute("/api/tryon")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Require authenticated user
        const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
        const token = authHeader?.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : null;
        if (!token) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePublishable = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabasePublishable) {
          return new Response("Auth not configured", { status: 500 });
        }
        const supabase = createClient(supabaseUrl, supabasePublishable, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const body = (await request.json()) as {
          userPhoto: string;
          garments?: Garment[];
          // legacy fallback
          productImage?: string;
          productTitle?: string;
        };

        const garments: Garment[] =
          body.garments && body.garments.length
            ? body.garments
            : body.productImage
              ? [{ image: body.productImage, title: body.productTitle ?? "garment", role: "top" }]
              : [];

        if (!body.userPhoto || garments.length === 0) {
          return new Response("Missing images", { status: 400 });
        }

        // userPhoto must be a data URL (uploaded by the user), not an arbitrary URL
        if (!body.userPhoto.startsWith("data:image/")) {
          return new Response("Invalid user photo", { status: 400 });
        }

        if (garments.length > 4) {
          return new Response("Too many garments", { status: 400 });
        }

        let garmentDataUrls;
        try {
          garmentDataUrls = await Promise.all(
            garments.map(async (g) => ({
              ...g,
              image: g.image.startsWith("data:")
                ? g.image
                : await fetchAsDataUrl(g.image),
            })),
          );
        } catch (e) {
          return new Response(
            e instanceof Error ? e.message : "Invalid garment image",
            { status: 400 },
          );
        }

        const outfitDesc = garmentDataUrls
          .map((g) => `${g.role === "top" ? "top" : g.role === "bottom" ? "bottom" : "full outfit"}: "${g.title}"`)
          .join(", ");

        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          {
            type: "text",
            text: `Create a photorealistic full-body virtual try-on. Take the person from the first image and generate a realistic model mockup of them wearing the following pieces together as a complete outfit — ${outfitDesc}. Preserve the person's face, skin tone, hair, and body proportions exactly. Match each garment's color, fabric, cut, and details precisely from its reference image. Show the full outfit from head to toe, natural pose, editorial fashion photography, studio lighting, dark neutral background.`,
          },
          { type: "image_url", image_url: { url: body.userPhoto } },
        ];
        for (const g of garmentDataUrls) {
          content.push({ type: "image_url", image_url: { url: g.image } });
        }

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/images/generations",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-image",
              messages: [{ role: "user", content }],
              modalities: ["image", "text"],
              stream: true,
            }),
          },
        );
        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "Upstream error", { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
