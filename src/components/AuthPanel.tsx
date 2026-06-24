import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(72);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Use international format, e.g. +14155550123");

type Mode = "signin" | "signup";

export function AuthPanel({ onAuthed }: { onAuthed?: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || undefined },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        onAuthed?.();
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    try {
      phoneSchema.parse(phone);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code sent. Check your messages.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("Enter the code");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      toast.success("Signed in.");
      onAuthed?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Sign-in failed");
        return;
      }
      if (result.redirected) return;
      onAuthed?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex gap-6 text-[11px] uppercase tracking-[0.22em]">
        <button
          onClick={() => setMode("signin")}
          className={`pb-1 border-b transition-colors ${mode === "signin" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`pb-1 border-b transition-colors ${mode === "signup" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Create Account
        </button>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-secondary/50">
          <TabsTrigger value="email" className="rounded-none uppercase tracking-[0.2em] text-[10px]">Email</TabsTrigger>
          <TabsTrigger value="phone" className="rounded-none uppercase tracking-[0.2em] text-[10px]">Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11" maxLength={100} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11" required />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-none uppercase tracking-[0.22em] text-xs h-11">
              {mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="phone" className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Phone</Label>
            <Input id="phone" type="tel" placeholder="+14155550123" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11" disabled={otpSent} />
          </div>
          {otpSent && (
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Code</Label>
              <Input id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11" maxLength={10} />
            </div>
          )}
          {!otpSent ? (
            <Button onClick={sendOtp} disabled={busy} className="w-full rounded-none uppercase tracking-[0.22em] text-xs h-11">Send Code</Button>
          ) : (
            <div className="space-y-2">
              <Button onClick={verifyOtp} disabled={busy} className="w-full rounded-none uppercase tracking-[0.22em] text-xs h-11">Verify & Sign In</Button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground">Use a different number</button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <div className="h-px flex-1 bg-border/60" />
        or
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <div className="space-y-2">
        <Button onClick={() => oauth("google")} disabled={busy} variant="outline" className="w-full rounded-none uppercase tracking-[0.22em] text-xs h-11 border-border/60">
          Continue with Google
        </Button>
        <Button onClick={() => oauth("apple")} disabled={busy} variant="outline" className="w-full rounded-none uppercase tracking-[0.22em] text-xs h-11 border-border/60">
          Continue with Apple
        </Button>
      </div>
    </div>
  );
}
