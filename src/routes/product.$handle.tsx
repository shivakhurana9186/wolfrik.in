import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Ruler, Truck, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PRODUCT_BY_HANDLE_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";
import { useCurrency } from "@/lib/currency";
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
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const { format } = useCurrency();

  useEffect(() => {
    let active = true;
    setActiveImage(0);
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

  const variant = product?.variants.edges.find(
    (v) => v.node.id === selectedVariantId
  )?.node;

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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-accent"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          Back to shop
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
          <>
            <div className="mt-8 grid md:grid-cols-2 gap-12">
              {/* Gallery */}
              <div>
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-muted cursor-zoom-in"
                  onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
                  onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setZoom({
                      on: true,
                      x: ((e.clientX - r.left) / r.width) * 100,
                      y: ((e.clientY - r.top) / r.height) * 100,
                    });
                  }}
                >
                  {product.images.edges[activeImage] ? (
                    <img
                      src={product.images.edges[activeImage].node.url}
                      alt={
                        product.images.edges[activeImage].node.altText ||
                        product.title
                      }
                      className="h-full w-full object-cover transition-transform duration-300"
                      style={
                        zoom.on
                          ? {
                              transform: "scale(1.8)",
                              transformOrigin: `${zoom.x}% ${zoom.y}%`,
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                {product.images.edges.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-3">
                    {product.images.edges.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`aspect-square overflow-hidden border-2 transition-colors ${
                          i === activeImage ? "border-accent" : "border-transparent"
                        }`}
                      >
                        <img
                          src={img.node.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:sticky md:top-24 md:self-start">
                <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                  WOLFRIK CO.
                </p>
                <h1 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">
                  {product.title}
                </h1>
                <p className="mt-4 text-lg">
                  {format(product.priceRange.minVariantPrice.amount)}
                </p>

                {product.variants.edges.length > 1 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Size
                      </p>
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent">
                          <Ruler className="h-3 w-3" /> Size guide
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">
                              Size Guide
                            </DialogTitle>
                          </DialogHeader>
                          <SizeGuide />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.edges.map((v) => (
                        <button
                          key={v.node.id}
                          onClick={() => setSelectedVariantId(v.node.id)}
                          disabled={!v.node.availableForSale}
                          className={`min-w-[3rem] px-4 py-2.5 border text-xs uppercase tracking-[0.18em] transition-colors ${
                            selectedVariantId === v.node.id
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border hover:border-accent"
                          } disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed`}
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
                  className="w-full mt-8 rounded-none uppercase tracking-[0.22em] text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : variant?.availableForSale ? (
                    "Add to bag"
                  ) : (
                    "Sold out"
                  )}
                </Button>

                {product.description && (
                  <div className="mt-10 border-t border-border pt-8">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
                      Details
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="mt-8 space-y-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-3">
                    <Truck className="h-3.5 w-3.5 text-accent" />
                    Free shipping on orders over $200
                  </p>
                  <p className="flex items-center gap-3">
                    <RotateCcw className="h-3.5 w-3.5 text-accent" />
                    Free returns within 30 days
                  </p>
                </div>

                {/* Reviews — empty state, no fabricated content */}
                <div className="mt-10 border-t border-border pt-8">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
                    Reviews
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    No reviews yet. Be the first to share your experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Related */}
            <section className="mt-32">
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                Pair with
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight">
                You might also like
              </h2>
              <div className="mt-10">
                <ProductGrid limit={4} />
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function SizeGuide() {
  const rows = [
    { size: "XS", chest: "34–36", waist: "27–29", hip: "35–37" },
    { size: "S", chest: "36–38", waist: "29–31", hip: "37–39" },
    { size: "M", chest: "38–40", waist: "31–33", hip: "39–41" },
    { size: "L", chest: "40–42", waist: "33–35", hip: "41–43" },
    { size: "XL", chest: "42–44", waist: "35–37", hip: "43–45" },
  ];
  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-4">
        Measurements in inches. For the best fit, measure across the fullest part of
        your chest, the narrowest part of your waist, and the widest part of your hips.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <th className="py-3 text-left">Size</th>
            <th className="py-3 text-left">Chest</th>
            <th className="py-3 text-left">Waist</th>
            <th className="py-3 text-left">Hip</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.size} className="border-b border-border/50">
              <td className="py-3 font-serif">{r.size}</td>
              <td className="py-3">{r.chest}</td>
              <td className="py-3">{r.waist}</td>
              <td className="py-3">{r.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
