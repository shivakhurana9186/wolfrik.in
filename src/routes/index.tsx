import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AuthPanel } from "@/components/AuthPanel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { WolfMark } from "@/components/WolfMark";
import { useAuth } from "@/hooks/useAuth";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WOLFRIK CO. — Enter the Pack" },
      { name: "description", content: "Sign in to WOLFRIK CO. — dark luxury streetwear for those who walk apart from the pack." },
      { property: "og:title", content: "WOLFRIK CO. — Enter the Pack" },
      { property: "og:description", content: "Wild by Nature. Refined by Choice." },
    ],
  }),
  component: Landing,
});

function Landing() {
  useCartSync();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/shop" });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Typographic hero — no big wolf image */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--accent) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--blood) 0, transparent 45%)",
          }}
        />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <WolfMark className="h-5 w-5 text-accent" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent">WOLFRIK CO.</p>
            </div>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Wild by Nature.
              <br />
              <span className="italic text-accent">Refined</span> by Choice.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
              Dark, considered streetwear for those who walk apart from the pack.
              Sign in to unlock early drops, member pricing, and the full archive.
            </p>

            {user && !loading && (
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-none uppercase tracking-[0.22em] text-xs">
                  <Link to="/shop">Enter the Shop</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-none border-foreground/40 uppercase tracking-[0.22em] text-xs hover:bg-foreground hover:text-background">
                  <Link to="/men">Alpha</Link>
                </Button>
              </div>
            )}

            <ul className="mt-10 space-y-3 text-sm text-muted-foreground">
              {[
                "Early access to limited drops",
                "Member-only pricing & rewards",
                "Saved wishlist across devices",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-px w-6 bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {!user && (
            <div className="md:justify-self-end w-full max-w-md">
              <div className="border border-border/60 bg-background/95 backdrop-blur-md p-8 md:p-10 shadow-2xl">
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Members</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight">Enter the Pack</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in or create your account to continue.
                </p>
                <div className="mt-6">
                  <AuthPanel onAuthed={() => navigate({ to: "/shop" })} />
                </div>
                <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  By continuing you agree to our{" "}
                  <Link to="/about" className="text-foreground hover:text-accent">Terms</Link>.
                </p>
              </div>
            </div>
          )}

          {user && (
            <div className="md:justify-self-end w-full max-w-md">
              <div className="border border-accent/30 bg-background/95 backdrop-blur-md p-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Welcome back</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight">
                  {user.email ?? user.phone}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You're signed in. The pack awaits.
                </p>
                <Button asChild className="mt-6 w-full rounded-none uppercase tracking-[0.22em] text-xs h-11">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Animated product carousel */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent">In Rotation</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight">The Pack</h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent"
          >
            View all →
          </Link>
        </div>
        <ProductCarousel />
      </section>

      <Footer />
    </div>
  );
}

