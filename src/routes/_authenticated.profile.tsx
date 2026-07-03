import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WolfMark } from "@/components/WolfMark";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — WOLFRIK CO." },
      { name: "description", content: "Your WOLFRIK CO. member profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const displayName =
    profile?.display_name ??
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "Member";

  const avatar =
    profile?.avatar_url ??
    user?.user_metadata?.avatar_url ??
    null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Member</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl tracking-tight">My Profile</h1>

        <div className="mt-10 border border-border/60 bg-background/95 p-8 md:p-10">
          <div className="flex items-center gap-6">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover border border-accent/30"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/5">
                <WolfMark className="h-8 w-8 text-accent" />
              </div>
            )}
            <div>
              <h2 className="font-serif text-2xl tracking-tight">{displayName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              {user?.phone && (
                <p className="mt-0.5 text-sm text-muted-foreground">{user.phone}</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="border border-border/60 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Status</p>
              <p className="mt-2 text-sm text-foreground">Active Member</p>
            </div>
            <div className="border border-border/60 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Member Since</p>
              <p className="mt-2 text-sm text-foreground">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="border border-border/60 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Last Sign In</p>
              <p className="mt-2 text-sm text-foreground">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
