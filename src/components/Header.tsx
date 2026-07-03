import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { WolfMark } from "@/components/WolfMark";
import { OfferBar } from "@/components/OfferBar";
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
      <OfferBar />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2 font-serif text-xl md:text-2xl tracking-[0.2em] uppercase">
          <WolfMark className="h-6 w-6 text-accent" />
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

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:block">
            <CurrencySwitcher />
          </div>
          <AuthButton />
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

function AuthButton() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <Link
        to="/auth"
        className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const initial = (user.email ?? user.phone ?? "U").charAt(0).toUpperCase();

  const signOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Signed out");
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="hidden sm:flex h-8 w-8 items-center justify-center border border-accent/40 text-[11px] font-medium text-accent hover:bg-accent hover:text-background transition-colors"
        title={user.email ?? user.phone ?? ""}
      >
        {initial}
      </Link>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="text-muted-foreground hover:text-accent transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
      <UserIcon className="sr-only" />
    </div>
  );
}

