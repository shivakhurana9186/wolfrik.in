import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES: { code: string; dial: string; label: string }[] = [
  { code: "US", dial: "+1", label: "United States (+1)" },
  { code: "CA", dial: "+1", label: "Canada (+1)" },
  { code: "GB", dial: "+44", label: "United Kingdom (+44)" },
  { code: "IN", dial: "+91", label: "India (+91)" },
  { code: "AU", dial: "+61", label: "Australia (+61)" },
  { code: "DE", dial: "+49", label: "Germany (+49)" },
  { code: "FR", dial: "+33", label: "France (+33)" },
  { code: "IT", dial: "+39", label: "Italy (+39)" },
  { code: "ES", dial: "+34", label: "Spain (+34)" },
  { code: "NL", dial: "+31", label: "Netherlands (+31)" },
  { code: "SE", dial: "+46", label: "Sweden (+46)" },
  { code: "NO", dial: "+47", label: "Norway (+47)" },
  { code: "DK", dial: "+45", label: "Denmark (+45)" },
  { code: "IE", dial: "+353", label: "Ireland (+353)" },
  { code: "CH", dial: "+41", label: "Switzerland (+41)" },
  { code: "AT", dial: "+43", label: "Austria (+43)" },
  { code: "BE", dial: "+32", label: "Belgium (+32)" },
  { code: "PT", dial: "+351", label: "Portugal (+351)" },
  { code: "PL", dial: "+48", label: "Poland (+48)" },
  { code: "MX", dial: "+52", label: "Mexico (+52)" },
  { code: "BR", dial: "+55", label: "Brazil (+55)" },
  { code: "AR", dial: "+54", label: "Argentina (+54)" },
  { code: "JP", dial: "+81", label: "Japan (+81)" },
  { code: "KR", dial: "+82", label: "South Korea (+82)" },
  { code: "CN", dial: "+86", label: "China (+86)" },
  { code: "HK", dial: "+852", label: "Hong Kong (+852)" },
  { code: "SG", dial: "+65", label: "Singapore (+65)" },
  { code: "MY", dial: "+60", label: "Malaysia (+60)" },
  { code: "TH", dial: "+66", label: "Thailand (+66)" },
  { code: "ID", dial: "+62", label: "Indonesia (+62)" },
  { code: "PH", dial: "+63", label: "Philippines (+63)" },
  { code: "VN", dial: "+84", label: "Vietnam (+84)" },
  { code: "PK", dial: "+92", label: "Pakistan (+92)" },
  { code: "BD", dial: "+880", label: "Bangladesh (+880)" },
  { code: "LK", dial: "+94", label: "Sri Lanka (+94)" },
  { code: "AE", dial: "+971", label: "UAE (+971)" },
  { code: "SA", dial: "+966", label: "Saudi Arabia (+966)" },
  { code: "QA", dial: "+974", label: "Qatar (+974)" },
  { code: "KW", dial: "+965", label: "Kuwait (+965)" },
  { code: "IL", dial: "+972", label: "Israel (+972)" },
  { code: "TR", dial: "+90", label: "Türkiye (+90)" },
  { code: "EG", dial: "+20", label: "Egypt (+20)" },
  { code: "ZA", dial: "+27", label: "South Africa (+27)" },
  { code: "NG", dial: "+234", label: "Nigeria (+234)" },
  { code: "KE", dial: "+254", label: "Kenya (+254)" },
  { code: "NZ", dial: "+64", label: "New Zealand (+64)" },
  { code: "RU", dial: "+7", label: "Russia (+7)" },
  { code: "UA", dial: "+380", label: "Ukraine (+380)" },
];

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(72);
const localPhoneSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5,14}$/, "Enter a valid phone number (digits only, no leading 0)");

type Mode = "signin" | "signup";

export function AuthPanel({ onAuthed, redirectTo }: { onAuthed?: () => void; redirectTo?: string }) {
  const oauthRedirect = redirectTo ?? (typeof window !== "undefined" ? window.location.origin : "/");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1");
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
            emailRedirectTo: oauthRedirect,
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

  const fullPhone = `${dialCode}${phone.replace(/\D/g, "")}`;

  const sendOtp = async () => {
    try {
      localPhoneSchema.parse(phone.replace(/\D/g, ""));
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
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
      const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
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
        redirect_uri: oauthRedirect,
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
            <div className="flex gap-2">
              <Select value={`${dialCode}|${COUNTRY_CODES.find(c => c.dial === dialCode)?.code ?? ""}`} onValueChange={(v) => setDialCode(v.split("|")[0])} disabled={otpSent}>
                <SelectTrigger className="w-[120px] rounded-none border-border/60 bg-transparent h-11">
                  <SelectValue>{dialCode}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={`${c.code}-${c.dial}`} value={`${c.dial}|${c.code}`}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input id="phone" type="tel" inputMode="tel" placeholder="4155550123" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none border-border/60 bg-transparent h-11 flex-1" disabled={otpSent} maxLength={15} />
            </div>
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
