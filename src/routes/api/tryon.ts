import { createFileRoute } from "@tanstack/react-router";

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch reference image: ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  const b64 = btoa(binary);
  return `data:${contentType};base64,${b64}`;
}

type Garment = { image: string; title: string; role: "top" | "bottom" | "full" };

export const Route = createFileRoute("/api/tryon")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        const garmentDataUrls = await Promise.all(
          garments.map(async (g) => ({
            ...g,
            image: g.image.startsWith("data:") ? g.image : await fetchAsDataUrl(g.image),
          })),
        );

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
