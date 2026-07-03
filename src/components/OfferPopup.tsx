import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WolfMark } from "@/components/WolfMark";

export function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("wolfrik_offer_seen")) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("wolfrik_offer_seen", "1");
    } catch {}
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md border border-accent/40 bg-background p-8 md:p-10 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 text-muted-foreground hover:text-accent"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex justify-center">
          <WolfMark className="h-6 w-6 text-accent" />
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-accent">Pack Offer</p>
        <h3 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight">
          Buy 3, <span className="italic text-accent">Get 1 Free</span>
        </h3>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Add any four pieces to your cart — the lowest priced one is on the house.
          Automatically applied at checkout.
        </p>
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full h-11 bg-accent text-accent-foreground uppercase tracking-[0.22em] text-xs hover:opacity-90 transition"
        >
          Shop the Offer
        </button>
      </div>
    </div>
  );
}
