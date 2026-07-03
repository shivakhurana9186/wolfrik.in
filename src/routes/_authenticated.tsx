import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
  pendingComponent: AuthenticatedLoading,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthenticatedLoading />;
  }

  return <Outlet />;
}

function AuthenticatedLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-accent">WOLFRIK CO.</p>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-16 bg-accent animate-pulse" />
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">Entering the pack...</p>
      </div>
    </div>
  );
}
