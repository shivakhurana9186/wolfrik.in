import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCurrency } from "@/lib/currency";
import type { ShopifyProduct } from "@/lib/shopify";

// Deterministic badge based on product id so the same product always gets the same badge
function badgeFor(id: string): { label: string; tone: "gold" | "blood" | "white" } | null {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const bucket = hash % 6;
  if (bucket === 0) return { label: "New", tone: "gold" };
  if (bucket === 1) return { label: "Bestseller", tone: "white" };
  if (bucket === 2) return { label: "Limited", tone: "blood" };
  return null;
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const { format } = useCurrency();

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const variant = node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const badge = badgeFor(node.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  const toneClass =
    badge?.tone === "gold"
      ? "bg-accent text-accent-foreground"
      : badge?.tone === "blood"
      ? "bg-[color:var(--blood)] text-foreground"
      : "bg-foreground text-background";

  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        {badge && (
          <span
            className={`absolute left-3 top-3 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${toneClass}`}
          >
            {badge.label}
          </span>
        )}
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            onClick={handleAdd}
            disabled={isLoading || !variant}
            className="w-full rounded-none bg-background/95 text-foreground hover:bg-accent hover:text-accent-foreground"
            size="sm"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Quick Add"}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-base leading-tight tracking-tight">{node.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {format(price.amount)}
          </p>
        </div>
      </div>
    </Link>
  );
}
