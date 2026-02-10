"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient } from "@/lib/supabase/client";
import { parsePhoneToE164 } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"phone" | "email">("phone");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const formattedPhone = parsePhoneToE164(phone);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      // Store phone for OTP page
      sessionStorage.setItem("auth_phone", formattedPhone);
      router.push("/login/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Show success message
      setError(null);
      alert("Check your email for the login link!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 pt-20 pb-6 px-6">
        <h1 className="font-display text-3xl font-extrabold text-primary">
          FanNu
        </h1>
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-center text-muted-foreground max-w-[300px]">
          Sign in to manage your drops, bookings, and audience
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-6">
        {mode === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251 9XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Sending..." : "Continue with Email"}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Toggle mode */}
        {mode === "phone" ? (
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => setMode("email")}
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Email
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => setMode("phone")}
          >
            <Phone className="mr-2 h-5 w-5" />
            Continue with Phone
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 py-10 px-6">
        <Link
          href="/apply"
          className="text-sm font-semibold text-primary hover:underline"
        >
          New creator? Apply to join
        </Link>
        <Link
          href="/support"
          className="text-sm text-muted-foreground hover:underline"
        >
          Need help? Contact support
        </Link>
      </div>
    </div>
  );
}
