import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-[0.2em] uppercase">
            Wolfrik<span className="text-accent">.</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground italic">
            Wild by Nature. Refined by Choice.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="mt-8 flex max-w-sm border border-border"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="bg-accent px-5 text-xs uppercase tracking-[0.2em] text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/men" className="hover:text-foreground">Alpha — Men</Link></li>
            <li><Link to="/women" className="hover:text-foreground">Luna — Women</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">All Products</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">House</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <p>© {new Date().getFullYear()} Wolfrik Co.</p>
          <p>Designed for the bold.</p>
        </div>
      </div>
    </footer>
  );
}
