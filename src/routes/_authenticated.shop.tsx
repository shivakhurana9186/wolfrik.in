import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useCartSync } from "@/hooks/useCartSync";

const shopSearchSchema = z.object({
  size: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/shop")({
  validateSearch: shopSearchSchema,
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

const SIZES = ["All", "XS", "S", "M", "L", "XL"];

function ShopAll() {
  useCartSync();
  const { size } = Route.useSearch();
  const active = size ?? "All";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The Collection</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">Shop All</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every piece across Alpha and Luna. Cut in small runs, made to last.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="flex flex-wrap items-center gap-2 border-t border-b border-border py-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mr-2">
            Size
          </span>
          {SIZES.map((s) => (
            <Link
              key={s}
              to="/shop"
              search={s === "All" ? {} : { size: s }}
              className={`min-w-[2.25rem] px-3 py-1.5 border text-[11px] uppercase tracking-[0.22em] transition-colors text-center ${
                active === s
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-6">
        <ProductGrid limit={48} size={size ?? null} groupAlphabetical />
      </section>
      <Footer />
    </div>
  );
}
