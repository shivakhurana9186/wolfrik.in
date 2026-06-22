import { createFileRoute, Link } from "@tanstack/react-router";
import wolfHero from "@/assets/wolf-hero.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WOLFRIK CO. — Wild by Nature. Refined by Choice." },
      {
        name: "description",
        content:
          "Dark luxury streetwear. Shop the Wolfrik Alpha (men) and Wolfrik Luna (women) collections.",
      },
      { property: "og:title", content: "WOLFRIK CO." },
      { property: "og:description", content: "Wild by Nature. Refined by Choice." },
      { property: "og:image", content: wolfHero },
      { property: "twitter:image", content: wolfHero },
    ],
  }),
  component: Index,
});

function Index() {
  useCartSync();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
        <img
          src={wolfHero}
          alt="A wolf with amber eyes in deep shadow — the spirit of WOLFRIK"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">
              Autumn / Winter — Collection 01
            </p>
            <h1 className="mt-6 font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              Wild by Nature.
              <br />
              <span className="italic text-accent">Refined</span> by Choice.
            </h1>
            <p className="mt-8 max-w-md text-base text-muted-foreground leading-relaxed">
              Dark, considered streetwear for those who walk apart from the pack.
              Built in small batches. Made to outlast trends.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none uppercase tracking-[0.22em] text-xs">
                <Link to="/men">Shop Alpha</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none border-foreground/40 uppercase tracking-[0.22em] text-xs hover:bg-foreground hover:text-background"
              >
                <Link to="/women">Shop Luna</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection split */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              to: "/men" as const,
              label: "Wolfrik Alpha",
              tag: "Men",
              copy: "Tees, hoodies, joggers, outerwear.",
            },
            {
              to: "/women" as const,
              label: "Wolfrik Luna",
              tag: "Women",
              copy: "Tops, dresses, leggings, layers.",
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative block aspect-[5/4] overflow-hidden border border-border/60"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background transition-opacity duration-700 group-hover:opacity-80" />
              <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-12">
                <p className="text-[10px] uppercase tracking-[0.35em] text-accent">{c.tag}</p>
                <h3 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">
                  {c.label}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{c.copy}</p>
                <span className="mt-6 inline-flex w-fit border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.22em] transition-colors group-hover:border-accent group-hover:text-accent">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The Pack</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">
              Bestsellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.22em] hover:text-accent hover:border-accent transition-colors"
          >
            Shop all →
          </Link>
        </div>
        <ProductGrid limit={8} />
      </section>

      {/* Brand story */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The House</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight">
              Born from the wild.
              <br />
              <span className="italic">Built for the bold.</span>
            </h2>
            <p className="mt-6 max-w-lg text-muted-foreground leading-relaxed">
              WOLFRIK CO. is for those who move with intent. Every piece is cut in small
              runs from premium fabrics, finished with quiet gold detail, and made to
              wear hard for years — not seasons.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.22em] hover:text-accent hover:border-accent transition-colors"
            >
              Read our story →
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={wolfHero}
              alt="WOLFRIK brand portrait"
              loading="lazy"
              className="h-full w-full object-cover grayscale opacity-90"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-accent/20" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
