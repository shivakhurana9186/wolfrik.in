import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCurrency } from "@/lib/currency";

export function ProductCarousel() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const { format } = useCurrency();

  useEffect(() => {
    let active = true;
    storefrontApiRequest(PRODUCTS_QUERY, { first: 12, query: null })
      .then((data) => {
        if (!active) return;
        setProducts(data?.data?.products?.edges ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (products.length === 0) return null;
  const loop = [...products, ...products];

  return (
    <div
      className="relative overflow-hidden group"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex gap-6 animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {loop.map((p, idx) => {
          const node = p.node;
          const image = node.images.edges[0]?.node;
          return (
            <Link
              key={`${node.id}-${idx}`}
              to="/product/$handle"
              params={{ handle: node.handle }}
              className="group/card w-[240px] md:w-[280px] shrink-0"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {image && (
                  <img
                    src={image.url}
                    alt={image.altText || node.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-serif text-sm truncate">{node.title}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent shrink-0">
                  {format(node.priceRange.minVariantPrice.amount)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
