import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "wolfrik_cookie_consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (v: "accept" | "decline") => {
    window.localStorage.setItem(KEY, v);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md z-50">
      <div className="relative border border-border bg-background/95 backdrop-blur-md p-6 shadow-2xl">
        <button
          onClick={() => decide("decline")}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Cookies</p>
        <p className="mt-3 text-sm text-foreground leading-relaxed">
          We use cookies to improve your shopping experience, analyze traffic, and remember your preferences. Choose what you're comfortable with.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => decide("accept")}
            className="flex-1 bg-accent text-accent-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] hover:bg-accent/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => decide("decline")}
            className="flex-1 border border-border text-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] hover:border-accent transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
