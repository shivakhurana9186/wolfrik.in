import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({ query = null, limit = 24 }: { query?: string | null; limit?: number }) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let active = true;
    storefrontApiRequest(PRODUCTS_QUERY, { first: limit, query })
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
  }, [query, limit]);

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
      {products.map((p) => (
        <ProductCard key={p.node.id} product={p} />
      ))}
    </div>
  );
}
