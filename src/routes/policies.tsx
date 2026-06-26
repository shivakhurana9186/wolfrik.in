import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Policies — WOLFRIK CO." },
      { name: "description", content: "Shipping, returns, privacy, and terms of service for WOLFRIK CO." },
      { property: "og:title", content: "Policies — WOLFRIK CO." },
      { property: "og:description", content: "Shipping, returns, privacy, and terms of service." },
    ],
  }),
  component: Policies,
});

function Policies() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 border-b border-border/60">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Legal</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">Policies</h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-16">
        {/* Shipping Policy */}
        <div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Shipping</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>We ship worldwide from our fulfillment centers. Orders are processed within 1–2 business days.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard shipping:</strong> 5–10 business days — calculated at checkout based on your location.</li>
              <li><strong>Express shipping:</strong> 2–5 business days — available at checkout for select countries.</li>
              <li>All orders include tracking. You'll receive a confirmation email with tracking details once your order ships.</li>
            </ul>
            <p>We are not responsible for delays caused by customs or local postal services.</p>
          </div>
        </div>

        {/* Returns & Exchanges */}
        <div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Returns & Exchanges</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>We accept returns and exchanges within <strong>30 days</strong> of delivery.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items must be unworn, unwashed, and with all original tags attached.</li>
              <li>Final sale items (marked on the product page) cannot be returned or exchanged.</li>
              <li>Return shipping is free for domestic orders. International return shipping costs are the responsibility of the customer.</li>
              <li>To initiate a return, contact us at <a href="mailto:hello@wolfrik.co" className="text-accent hover:underline">hello@wolfrik.co</a> with your order number.</li>
            </ul>
            <p>Refunds are processed to the original payment method within 5–10 business days after we receive the returned item.</p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Privacy Policy</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>WOLFRIK CO. respects your privacy. This policy explains how we collect, use, and protect your personal information.</p>
            <h3 className="text-foreground font-medium mt-4">Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal info:</strong> name, email, phone number, shipping/billing address — collected during checkout or account creation.</li>
              <li><strong>Payment info:</strong> handled securely by our payment processors (Shopify Payments, PayPal). We do not store full card details.</li>
              <li><strong>Usage data:</strong> pages visited, products viewed, and device information — used to improve our store experience.</li>
            </ul>
            <h3 className="text-foreground font-medium mt-4">How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process and fulfill your orders.</li>
              <li>To communicate order updates, shipping notifications, and promotional offers (you can opt out anytime).</li>
              <li>To improve our website and product offerings.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </div>
        </div>

        {/* Terms of Service */}
        <div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Terms of Service</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>By accessing and placing an order with WOLFRIK CO., you agree to be bound by the following terms and conditions.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are listed in the currency shown at checkout and are subject to applicable taxes.</li>
              <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
              <li>Product images are for representation purposes. Slight color variations may occur due to monitor differences.</li>
              <li>We are not liable for any damages arising from the use of our products beyond the purchase price.</li>
              <li>These terms are governed by the laws of the jurisdiction in which WOLFRIK CO. is registered.</li>
            </ul>
            <p>For any questions regarding these terms, contact <a href="mailto:hello@wolfrik.co" className="text-accent hover:underline">hello@wolfrik.co</a>.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
