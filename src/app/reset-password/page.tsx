"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <FiAlertCircle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-[var(--foreground)] mb-2">
          Invalid Reset Link
        </h1>
        <p className="text-[var(--muted)] mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/login?reset=true"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <GiSoccerBall className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
          Reset Your Password
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Enter a new password for your account.
        </p>
      </div>

      {status === "success" ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-500/20 flex items-center justify-center">
            <FiCheck className="w-8 h-8 text-secondary-500" />
          </div>
          <p className="text-[var(--muted)] mb-2">{message}</p>
          <p className="text-sm text-secondary-500">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="input pl-10 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            {/* Password Requirements */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: "At least 8 characters", test: password.length >= 8 },
                { label: "One uppercase letter", test: /[A-Z]/.test(password) },
                { label: "One lowercase letter", test: /[a-z]/.test(password) },
                { label: "One number", test: /[0-9]/.test(password) },
              ].map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs ${
                    req.test ? "text-secondary-500" : "text-[var(--muted)]"
                  }`}
                >
                  <FiCheck
                    className={`w-3 h-3 ${
                      req.test ? "opacity-100" : "opacity-30"
                    }`}
                  />
                  {req.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="input pl-10 w-full"
              />
            </div>
            {/* Password match indicator */}
            {confirmPassword && (
              <div className={`mt-2 text-xs flex items-center gap-1 ${
                password === confirmPassword ? "text-secondary-500" : "text-accent-500"
              }`}>
                <FiCheck className={password === confirmPassword ? "opacity-100" : "opacity-0"} />
                {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-accent-500 text-sm">
              <FiAlertCircle />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary w-full"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link 
          href="/login" 
          className="text-[var(--muted)] hover:text-primary-500 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Suspense fallback={
          <div className="card p-8 text-center">
            <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
