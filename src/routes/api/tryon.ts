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

export const Route = createFileRoute("/api/tryon")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { userPhoto, productImage, productTitle } = (await request.json()) as {
          userPhoto: string; // data URL
          productImage: string; // http URL
          productTitle: string;
        };
        if (!userPhoto || !productImage) {
          return new Response("Missing images", { status: 400 });
        }

        const productDataUrl = productImage.startsWith("data:")
          ? productImage
          : await fetchAsDataUrl(productImage);

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
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Create a photorealistic virtual try-on image. Take the person from the first image and show them naturally wearing the garment from the second image ("${productTitle}"). Preserve the person's face, skin tone, hair, and body proportions exactly. Match the garment's color, fabric, cut, and details precisely. Studio lighting, editorial fashion photography, dark neutral background.`,
                    },
                    { type: "image_url", image_url: { url: userPhoto } },
                    { type: "image_url", image_url: { url: productDataUrl } },
                  ],
                },
              ],
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
