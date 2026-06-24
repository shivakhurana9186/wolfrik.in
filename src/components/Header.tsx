import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


export function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/men", label: "Alpha" },
    { to: "/women", label: "Luna" },
    { to: "/shop", label: "Shop All" },
    { to: "/journal", label: "Journal" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase">
          Wolfrik<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-accent transition-colors"
              activeProps={{ className: "text-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <CurrencySwitcher />
          </div>
          <CartDrawer />
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/60 bg-background">
          <div className="flex flex-col px-6 py-4 gap-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="hover:text-accent transition-colors"
                activeProps={{ className: "text-accent" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
