import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/CartDrawer";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-serif text-2xl tracking-tight">
          Maison&nbsp;Ovum
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Shop</Link>
          <a href="#journal" className="hover:text-foreground transition-colors">Journal</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}
