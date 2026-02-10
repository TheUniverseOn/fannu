"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedPhone = sessionStorage.getItem("auth_phone");
    if (!storedPhone) {
      router.push("/login");
      return;
    }
    setPhone(storedPhone);
  }, [router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });

      if (error) throw error;

      // Clear stored phone
      sessionStorage.removeItem("auth_phone");

      // Redirect to dashboard
      router.push("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signInWithOtp({ phone });
      setResendTimer(60);
    } catch {
      setError("Failed to resend code");
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith("+251")) {
      return `+251 ${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 pt-20 pb-6 px-6">
        <h1 className="font-display text-3xl font-extrabold text-primary">
          FanNu
        </h1>
        <h2 className="text-2xl font-bold text-foreground">Verify your number</h2>
        <p className="text-center text-muted-foreground max-w-[300px]">
          We sent a 6-digit code to {formatPhone(phone)}
        </p>
      </div>

      {/* OTP Form */}
      <div className="flex-1 px-6 py-6">
        <div className="flex flex-col items-center gap-6">
          {/* OTP Boxes */}
          <div className="flex gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold rounded-xl bg-card border-2 transition-colors focus:outline-none focus:border-primary",
                  digit ? "border-primary" : "border-border"
                )}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Verify Button */}
          <Button
            className="w-full h-12"
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading || otp.some((d) => !d)}
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </Button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={cn(
              "text-sm",
              resendTimer > 0 ? "text-muted-foreground" : "text-primary hover:underline"
            )}
          >
            {resendTimer > 0
              ? `Didn't receive it? Resend in 0:${resendTimer.toString().padStart(2, "0")}`
              : "Resend code"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 py-10 px-6">
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Use a different number
        </Link>
      </div>
    </div>
  );
}
