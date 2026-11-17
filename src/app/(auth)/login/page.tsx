"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient, getSupabaseEnv } from "@/lib/supabase/client";
import { Mail, Lock, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      setErrorMessage(
        "Supabase configuration is missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured in your Vercel project settings and redeploy."
      );
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (msg.includes("email not confirmed")) {
          setErrorMessage("Email not confirmed yet. Please check your inbox.");
        } else if (msg.includes("failed to fetch") || msg.includes("network")) {
          setErrorMessage("Connection failed. Please check your network and try again.");
        } else {
          setErrorMessage(error.message);
        }
      } else if (data?.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (errStr.includes("failed to fetch") || errStr.includes("network")) {
        setErrorMessage("Connection failed. Please check your network and try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg text-[#0F172A] placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:bg-white focus:border-[#0B1F33] focus:ring-2 focus:ring-[#0B1F33]/10 disabled:opacity-50";

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#0B1F33]">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to your operations portal</p>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="name@preedhar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-lg bg-[#0B1F33] hover:bg-[#0F2940] active:scale-[0.99] text-white shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Authorized Personnel Only &mdash; Secure Portal</span>
      </div>
    </div>
  );
}
