import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Display-only conversion. Checkout always charges in the store's base currency (USD).
export const CURRENCIES = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  CAD: { symbol: "C$", rate: 1.37 },
  AUD: { symbol: "A$", rate: 1.52 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amount: string | number, baseCode?: string) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("wolfrik_currency") : null;
    if (saved && saved in CURRENCIES) setCurrencyState(saved as CurrencyCode);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") window.localStorage.setItem("wolfrik_currency", c);
  };

  const format = (amount: string | number) => {
    const n = typeof amount === "string" ? parseFloat(amount) : amount;
    const { symbol, rate } = CURRENCIES[currency];
    return `${symbol}${(n * rate).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
