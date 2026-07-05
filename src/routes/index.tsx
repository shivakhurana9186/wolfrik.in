import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { WolfMark } from "@/components/WolfMark";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WOLFRIK CO. — Enter the Pack" },
      { name: "description", content: "Sign in to WOLFRIK CO. — dark luxury streetwear for those who walk apart from the pack." },
      { property: "og:title", content: "WOLFRIK CO. — Enter the Pack" },
      { property: "og:description", content: "Wild by Nature. Refined by Choice." },
    ],
  }),
  component: LoginLanding,
});

function LoginLanding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/shop" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--accent) 0, transparent 45%), radial-gradient(circle at 80% 80%, var(--blood) 0, transparent 50%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <WolfMark className="h-10 w-10 text-accent" />
          <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-accent">WOLFRIK CO.</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight leading-[1]">
            Enter the <span className="italic text-accent">Pack</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Sign in to unlock the collection.
          </p>
        </div>

        <div className="mt-10 border border-border/60 bg-background/95 backdrop-blur-md p-8 shadow-2xl">
          <AuthPanel onAuthed={() => navigate({ to: "/shop" })} />
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Wild by Nature · Refined by Choice
        </p>
      </div>
    </div>
  );
}
