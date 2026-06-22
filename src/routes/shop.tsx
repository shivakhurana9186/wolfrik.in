import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — WOLFRIK CO." },
      { name: "description", content: "Shop every WOLFRIK CO. piece — Alpha and Luna." },
      { property: "og:title", content: "Shop All — WOLFRIK CO." },
      { property: "og:description", content: "Every piece. One pack." },
    ],
  }),
  component: ShopAll,
});

function ShopAll() {
  useCartSync();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The Collection</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">Shop All</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every piece across Alpha and Luna. Cut in small runs, made to last.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <ProductGrid limit={48} />
      </section>
      <Footer />
    </div>
  );
}
