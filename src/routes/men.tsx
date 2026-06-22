import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/men")({
  head: () => ({
    meta: [
      { title: "Wolfrik Alpha — Men's Collection | WOLFRIK CO." },
      { name: "description", content: "Tees, hoodies, joggers, outerwear and accessories for the Alpha." },
      { property: "og:title", content: "Wolfrik Alpha — Men's Collection" },
      { property: "og:description", content: "Dark luxury streetwear, cut for the Alpha." },
    ],
  }),
  component: AlphaPage,
});

function AlphaPage() {
  useCartSync();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Men</p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl tracking-tight">
            Wolfrik <span className="italic text-accent">Alpha</span>
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
            Heavyweight tees, brushed cotton hoodies, tailored joggers and outer layers.
            Built to hold its shape — and yours.
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
