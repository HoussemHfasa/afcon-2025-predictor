"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiLoader, FiMail } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired" | "no-token">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          // Check if it's an "already used" error
          if (data.alreadyUsed) {
            setStatus("success"); // Show as success since they're likely verified
            setMessage("Your email is already verified! You can log in now.");
          } else if (data.expired) {
            setStatus("expired");
            setMessage("This verification link has expired. Please request a new one.");
          } else {
            setStatus("error");
            setMessage(data.error || "Verification failed.");
          }
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="card text-center p-8">
          {/* Logo */}
          <div className="mx-auto mb-6">
            <GiSoccerBall className="w-16 h-16 text-primary-500 mx-auto" />
          </div>

          {/* Status Icon */}
          {status === "loading" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <FiLoader className="w-16 h-16 text-primary-500 mx-auto" />
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <FiCheckCircle className="w-16 h-16 text-secondary-500 mx-auto" />
            </motion.div>
          )}

          {(status === "error" || status === "no-token" || status === "expired") && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <FiXCircle className="w-16 h-16 text-accent-500 mx-auto" />
            </motion.div>
          )}

          {/* Title */}
          <h1 className="mt-6 text-2xl font-display font-bold text-[var(--foreground)]">
            {status === "loading" && "Verifying Your Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "expired" && "Link Expired"}
            {status === "no-token" && "Invalid Link"}
          </h1>

          {/* Message */}
          <p className="mt-4 text-[var(--muted)]">
            {message}
          </p>

          {/* Success redirect notice */}
          {status === "success" && (
            <p className="mt-4 text-sm text-secondary-500">
              Redirecting to login page in 3 seconds...
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 space-y-4">
            {status === "success" && (
              <Link href="/login?verified=true" className="btn-primary w-full block text-center">
                Go to Login
              </Link>
            )}

            {(status === "error" || status === "no-token" || status === "expired") && (
              <>
                <Link href="/resend-verification" className="btn-primary w-full block text-center">
                  <FiMail className="inline mr-2" />
                  Resend Verification Email
                </Link>
                <Link href="/login" className="btn-ghost w-full block text-center">
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-[var(--muted)]">
          Having trouble?{" "}
          <a href="mailto:afcon.2025mar@gmail.com" className="text-primary-500 hover:underline">
            Contact support
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
