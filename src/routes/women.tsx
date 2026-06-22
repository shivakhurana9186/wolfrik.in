import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "Wolfrik Luna — Women's Collection | WOLFRIK CO." },
      { name: "description", content: "Tops, dresses, leggings, hoodies and accessories for the Luna." },
      { property: "og:title", content: "Wolfrik Luna — Women's Collection" },
      { property: "og:description", content: "Dark luxury streetwear, cut for the Luna." },
    ],
  }),
  component: LunaPage,
});

function LunaPage() {
  useCartSync();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Women</p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl tracking-tight">
            Wolfrik <span className="italic text-accent">Luna</span>
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
            Silhouettes that move with you. Cropped tops, fluid dresses, second-skin
            leggings and the kind of hoodie you'll never give back.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <ProductGrid limit={48} />
      </section>

      <Footer />
    </div>
  );
}
