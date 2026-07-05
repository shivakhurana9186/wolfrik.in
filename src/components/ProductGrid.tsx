import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({
  query = null,
  limit = 24,
  size = null,
  groupAlphabetical = false,
}: {
  query?: string | null;
  limit?: number;
  size?: string | null;
  groupAlphabetical?: boolean;
}) {

  const [all, setAll] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let active = true;
    storefrontApiRequest(PRODUCTS_QUERY, { first: limit, query })
      .then((data) => {
        if (!active) return;
        setAll(data?.data?.products?.edges ?? []);
      })
      .catch((e) => {
        console.error(e);
        if (active) setAll([]);
      });
    return () => {
      active = false;
    };
  }, [query, limit]);

  const products =
    all && size
      ? all.filter((p) =>
          p.node.variants.edges.some((v) =>
            v.node.selectedOptions.some(
              (o) =>
                o.name.toLowerCase() === "size" &&
                o.value.toLowerCase() === size.toLowerCase() &&
                v.node.availableForSale,
            ),
          ),
        )
      : all;

  if (products === null) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="mt-4 h-4 w-2/3 bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-1/3 bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-border py-24 text-center">
        <p className="font-serif text-2xl">No products found</p>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          New drops coming soon. Sign up below to be the first to know.
        </p>
      </div>
    );
  }

  if (!groupAlphabetical) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
        {products.map((p) => (
          <ProductCard key={p.node.id} product={p} />
        ))}
      </div>
    );
  }

  // Group alphabetically by first letter of title
  const sorted = [...products].sort((a, b) =>
    a.node.title.localeCompare(b.node.title),
  );
  const groups = new Map<string, ShopifyProduct[]>();
  for (const p of sorted) {
    const ch = (p.node.title[0] || "#").toUpperCase();
    const key = /[A-Z]/.test(ch) ? ch : "#";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const letters = Array.from(groups.keys());

  return (
    <div>
      {/* A–Z jump nav */}
      <div className="sticky top-16 z-20 -mx-6 mb-8 border-y border-border bg-background/95 backdrop-blur px-6 py-3">
        <div className="flex flex-wrap justify-center gap-1.5">
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="min-w-[1.75rem] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-transparent hover:border-accent hover:text-accent transition-colors text-center"
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        {letters.map((l) => (
          <section key={l} id={`letter-${l}`} className="scroll-mt-32">
            <div className="mb-8 flex items-baseline gap-6">
              <h2 className="font-serif text-6xl md:text-7xl text-accent leading-none">
                {l}
              </h2>
              <span className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {groups.get(l)!.length} {groups.get(l)!.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
              {groups.get(l)!.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

