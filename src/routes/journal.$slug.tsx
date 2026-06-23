import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPost, JOURNAL } from "@/lib/journal";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    const title = loaderData ? `${loaderData.title} — WOLFRIK Journal` : "Journal — WOLFRIK CO.";
    const desc = loaderData?.excerpt ?? "Notes from WOLFRIK CO.";
    const url = `https://outfit-palace-go.lovable.app/journal/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-serif text-3xl">Post not found</p>
        <Link to="/journal" className="mt-6 inline-block text-sm text-accent uppercase tracking-[0.22em]">
          Back to journal
        </Link>
      </div>
      <Footer />
    </div>
  ),
  component: JournalPost,
});

function JournalPost() {
  const post = Route.useLoaderData();
  const others = JOURNAL.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/journal"
          className="inline-flex items-center text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-accent"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          Journal
        </Link>

        <p className="mt-10 text-[10px] uppercase tracking-[0.35em] text-accent">{post.category}</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight leading-[1.1]">{post.title}</h1>
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readTime}
        </p>

        <div className="mt-12 space-y-6 text-base md:text-lg leading-relaxed text-foreground/90">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {others.length > 0 && (
          <div className="mt-24 border-t border-border pt-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Keep reading</p>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to="/journal/$slug"
                  params={{ slug: o.slug }}
                  className="group block"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{o.category}</p>
                  <h3 className="mt-2 font-serif text-xl group-hover:text-accent transition-colors">{o.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
      <Footer />
    </div>
  );
}
