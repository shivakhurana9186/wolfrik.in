import { useEffect, useState, useRef } from "react";

const MESSAGES = [
  "Buy 3 Get 1 Free — on the entire pack",
  "Winter Drop — new arrivals live now",
  "Summer Edit — limited runs, member pricing",
  "Free shipping on orders over ₹2000",
];

export function OfferBar() {
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 40) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="w-full bg-accent text-accent-foreground overflow-hidden transition-transform duration-300 ease-out"
      style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
    >
      <div className="mx-auto max-w-7xl px-6 h-8 flex items-center justify-center relative">
        {MESSAGES.map((m, idx) => (
          <span
            key={idx}
            className="absolute inset-0 flex items-center justify-center text-[10px] md:text-[11px] uppercase tracking-[0.28em] font-medium transition-opacity duration-500"
            style={{ opacity: i === idx ? 1 : 0 }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
