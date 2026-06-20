import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Ovum — Considered Everyday Clothing" },
      {
        name: "description",
        content:
          "Quietly elegant wardrobe essentials cut from natural fibres. Shop the latest collection from Maison Ovum.",
      },
      { property: "og:title", content: "Maison Ovum — Considered Everyday Clothing" },
      {
        property: "og:description",
        content:
          "Quietly elegant wardrobe essentials cut from natural fibres. Shop the latest collection.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useCartSync();
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let active = true;
    storefrontApiRequest(PRODUCTS_QUERY, { first: 24, query: null })
      .then((data) => {
        if (!active) return;
        setProducts(data?.data?.products?.edges ?? []);
      })
      .catch((e) => {
        console.error(e);
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="grid md:grid-cols-2 min-h-[80vh]">
          <div className="flex items-center px-6 md:px-16 py-16 md:py-24 order-2 md:order-1">
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Autumn / Winter
              </p>
              <h1 className="mt-6 font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight">
                A wardrobe, quietly considered.
              </h1>
              <p className="mt-6 text-base text-muted-foreground leading-relaxed">
                Pieces designed in small batches from natural fibres — meant to be worn often,
                kept long, and loved well.
              </p>
              <div className="mt-10 flex gap-4">
                <Button asChild size="lg">
                  <a href="#shop">Shop the collection</a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href="#about">Our story</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden">
            <img
              src={heroImg}
              alt="Two models wearing minimalist neutral clothing against a warm plaster wall"
              width={1600}
              height={1024}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="shop" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              The collection
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">
              New arrivals
            </h2>
          </div>
        </div>

        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="mt-4 h-4 w-2/3 bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-1/3 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center">
            <p className="font-serif text-2xl">No products found</p>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Tell the chat what you want to sell — name, price, and a short description —
              and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">About</p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-snug">
            Slow, intentional, and made to last.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            We work with a small atelier in Porto, choosing organic cottons, washed linens and
            responsibly sourced wool. Every garment is cut to a generous, timeless silhouette —
            the kind you reach for, season after season.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-serif text-lg text-foreground">Maison Ovum</p>
          <p>© {new Date().getFullYear()} Maison Ovum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
