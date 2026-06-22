import { createFileRoute } from "@tanstack/react-router";
import wolfHero from "@/assets/wolf-hero.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WOLFRIK CO." },
      { name: "description", content: "The story behind WOLFRIK CO. — wild by nature, refined by choice." },
      { property: "og:title", content: "About — WOLFRIK CO." },
      { property: "og:description", content: "Born from the wild. Built for the bold." },
      { property: "og:image", content: wolfHero },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="relative h-[60vh] min-h-[420px] overflow-hidden border-b border-border/60">
        <img src={wolfHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Our story</p>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
              Born from the wild.
              <br />
              <span className="italic text-accent">Built for the bold.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 space-y-10 text-lg leading-relaxed text-muted-foreground">
        <p>
          WOLFRIK CO. began with a single idea — that what we wear should feel as
          deliberate as how we move. We design for the ones who don't run with the
          herd. The ones who choose their own line, their own pace, their own quiet.
        </p>
        <p>
          Every piece is built in small batches with heavyweight fabrics, considered
          construction and quiet gold finishing. Nothing flashy. Nothing fragile.
          Just garments that earn their place in your wardrobe and stay there.
        </p>
        <p className="text-foreground font-serif text-2xl md:text-3xl leading-snug">
          "Wild by nature. Refined by choice."
        </p>
      </section>

      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            { title: "Considered Design", body: "Each silhouette is drafted, walked in, then re-cut. We ship pieces when they're right, not when they're due." },
            { title: "Premium Fabrics", body: "Heavyweight cottons, brushed fleeces, technical knits — sourced for hand-feel and longevity." },
            { title: "Small Batch", body: "We produce in limited runs so nothing is overstocked, overcut, or oversold." },
          ].map((v) => (
            <div key={v.title}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Value</p>
              <h3 className="mt-3 font-serif text-2xl tracking-tight">{v.title}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
