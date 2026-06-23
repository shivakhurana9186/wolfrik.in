import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JOURNAL } from "@/lib/journal";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — WOLFRIK CO." },
      { name: "description", content: "Manifesto, edits, and craft notes from WOLFRIK CO." },
      { property: "og:title", content: "Journal — WOLFRIK CO." },
      { property: "og:description", content: "Manifesto, edits, and craft notes from WOLFRIK CO." },
      { property: "og:url", content: "https://outfit-palace-go.lovable.app/journal" },
    ],
    links: [{ rel: "canonical", href: "https://outfit-palace-go.lovable.app/journal" }],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The Journal</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">Notes from the House</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Manifesto, edits, craft. The thinking behind the work.
        </p>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {JOURNAL.map((p) => (
            <Link
              key={p.slug}
              to="/journal/$slug"
              params={{ slug: p.slug }}
              className="group block border-t border-border pt-8 hover:border-accent transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">{p.category}</p>
              <h2 className="mt-3 font-serif text-2xl md:text-3xl tracking-tight group-hover:text-accent transition-colors">
                {p.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.readTime}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
