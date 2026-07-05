import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/~oauth/callback")({
  component: OAuthCallback,
});

function OAuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        // 1) Handle implicit-flow tokens in the URL hash (#access_token=...)
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (hashError) {
          setMessage(decodeURIComponent(hashError));
          return;
        }

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            setMessage(error.message);
            return;
          }
        } else {
          // 2) Handle PKCE / code-flow (?code=...)
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          const qsError = url.searchParams.get("error_description") || url.searchParams.get("error");
          if (qsError) {
            setMessage(decodeURIComponent(qsError));
            return;
          }
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (error) {
              setMessage(error.message);
              return;
            }
          }
        }

        // 3) Read intended destination (if any) — sanitize to same-origin path
        let dest = "/shop";
        try {
          const saved = sessionStorage.getItem("post_login_redirect");
          if (saved && saved.startsWith("/") && !saved.startsWith("//")) dest = saved;
          sessionStorage.removeItem("post_login_redirect");
        } catch {
          // ignore storage errors
        }

        // 4) Clear the URL hash so tokens don't linger in history
        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, "", window.location.pathname);
        }

        // 5) Wait briefly for the session to settle, then navigate
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          navigate({ to: dest, replace: true });
        } else {
          // No session established — send back to sign in
          navigate({ to: "/", replace: true });
        }
      } catch (err: any) {
        if (!cancelled) setMessage(err?.message ?? "Sign-in failed");
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
