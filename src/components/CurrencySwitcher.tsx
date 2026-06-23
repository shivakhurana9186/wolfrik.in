import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="appearance-none bg-transparent text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent cursor-pointer focus:outline-none pr-3"
      >
        {Object.keys(CURRENCIES).map((c) => (
          <option key={c} value={c} className="bg-background text-foreground">
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
