import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Beta OAuth surface — narrow typed wrapper.
type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

interface OAuthNamespace {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
}

function getOAuthApi(): OAuthNamespace {
  const api = (supabase.auth as unknown as { oauth?: OAuthNamespace }).oauth;
  if (!api) throw new Error("OAuth 2.1 authorization server is not enabled on this project.");
  return api;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await getOAuthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-6 py-20 text-foreground">
      <h1 className="font-serif text-2xl">Authorization error</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = getOAuthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-20">
        <p className="text-[10px] uppercase tracking-[0.4em] text-accent">WOLFRIK CO.</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight">
          Connect {clientName} to your account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This lets {clientName} use WOLFRIK CO. tools on your behalf. You can revoke
          access at any time from your profile.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded bg-accent px-4 py-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            {busy ? "Working…" : "Approve"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded border border-border px-4 py-3 text-sm disabled:opacity-50"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}
