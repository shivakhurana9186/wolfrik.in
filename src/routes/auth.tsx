import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthPanel } from "@/components/AuthPanel";
import { WolfMark } from "@/components/WolfMark";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Enter the Pack — WOLFRIK CO." },
      { name: "description", content: "Sign in to WOLFRIK CO. — dark luxury streetwear for those who walk apart from the pack." },
      { property: "og:title", content: "Enter the Pack — WOLFRIK CO." },
      { property: "og:description", content: "Wild by Nature. Refined by Choice." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/shop", replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20">
        <WolfMark className="h-8 w-8 text-accent" />
        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-accent">WOLFRIK CO.</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight">Enter the Pack</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Sign in or create your account to unlock early drops and member pricing.
        </p>
        <div className="mt-8 w-full">
          <AuthPanel onAuthed={() => navigate({ to: "/shop", replace: true })} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
