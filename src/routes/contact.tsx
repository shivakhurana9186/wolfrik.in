import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — WOLFRIK CO." },
      { name: "description", content: "Get in touch with the WOLFRIK CO. team. We reply within 48 hours." },
      { property: "og:title", content: "Contact — WOLFRIK CO." },
      { property: "og:description", content: "We reply within 48 hours." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  message: z.string().trim().min(1, "Message required").max(2000),
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message received. We'll be in touch.");
      form.reset();
      setSubmitting(false);
    }, 600);
  };

  const faqs = [
    { q: "Where do you ship?", a: "Worldwide. Shipping is calculated at checkout." },
    { q: "What is your returns policy?", a: "Free returns within 30 days on unworn items with tags." },
    { q: "When will I get my order?", a: "Most orders ship within 48 hours. Delivery is 3–7 business days." },
    { q: "Do you restock sold-out items?", a: "Some pieces return; limited drops do not. Join the list to be notified." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 border-b border-border/60">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Contact</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">Say hello.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Press, partnerships, or product questions — drop us a line. We reply within 48 hours.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 md:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Name</label>
            <input
              name="name"
              required
              maxLength={100}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              maxLength={2000}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-none uppercase tracking-[0.22em] text-xs"
            size="lg"
          >
            {submitting ? "Sending…" : "Send Message"}
          </Button>
        </form>

        <div className="space-y-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Email</p>
            <p className="mt-2 font-serif text-2xl">hello@wolfrik.co</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Press</p>
            <p className="mt-2 font-serif text-2xl">press@wolfrik.co</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Social</p>
            <div className="mt-2 flex gap-4 text-sm">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-accent">TikTok</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">FAQ</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight">Questions</h2>
          <dl className="mt-10 divide-y divide-border">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-serif text-lg">{f.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  );
}
