import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";

type ProductNode = ShopifyProduct["node"];

export const Route = createFileRoute("/product/$handle")({
  component: ProductPage,
});

function ProductPage() {
  useCartSync();
  const { handle } = Route.useParams();
  const [product, setProduct] = useState<ProductNode | null | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    let active = true;
    storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle })
      .then((data) => {
        if (!active) return;
        const p: ProductNode | null = data?.data?.product ?? null;
        setProduct(p);
        setSelectedVariantId(p?.variants.edges[0]?.node.id ?? null);
      })
      .catch(() => active && setProduct(null));
    return () => {
      active = false;
    };
  }, [handle]);

  const variant = product?.variants.edges.find((v) => v.node.id === selectedVariantId)?.node;

  const handleAdd = async () => {
    if (!product || !variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Link>

        {product === undefined ? (
          <div className="py-32 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : product === null ? (
          <div className="py-32 text-center">
            <p className="font-serif text-2xl">Product not found</p>
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              {product.images.edges.length > 0 ? (
                product.images.edges.map((img, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={img.node.url}
                      alt={img.node.altText || product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="aspect-[3/4] bg-muted" />
              )}
            </div>

            <div className="md:sticky md:top-24 md:self-start">
              <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{product.title}</h1>
              <p className="mt-4 text-lg">
                {product.priceRange.minVariantPrice.currencyCode}{" "}
                {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>

              <p className="mt-8 text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>

              {product.variants.edges.length > 1 && (
                <div className="mt-10">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Options
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.edges.map((v) => (
                      <button
                        key={v.node.id}
                        onClick={() => setSelectedVariantId(v.node.id)}
                        disabled={!v.node.availableForSale}
                        className={`px-4 py-2 border text-sm transition-colors ${
                          selectedVariantId === v.node.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {v.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAdd}
                disabled={isLoading || !variant?.availableForSale}
                size="lg"
                className="w-full mt-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : variant?.availableForSale ? (
                  "Add to bag"
                ) : (
                  "Sold out"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
