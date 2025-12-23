"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiRefreshCw, FiInbox, FiAlertCircle } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="card p-8 text-center">
          {/* Animated envelope icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center"
          >
            <FiMail className="w-10 h-10 text-primary-500" />
          </motion.div>

          <h1 className="text-2xl font-display font-bold text-[var(--foreground)] mb-2">
            Check Your Email! 📧
          </h1>
          
          <p className="text-[var(--muted)] mb-6">
            We&apos;ve sent a verification link to
            {email && (
              <span className="block mt-2 font-semibold text-primary-500">
                {email}
              </span>
            )}
          </p>

          {/* Instructions */}
          <div className="bg-[var(--muted-bg)] rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <FiInbox className="text-primary-500" />
              Next Steps:
            </h3>
            <ol className="space-y-2 text-sm text-[var(--muted)]">
              <li className="flex gap-2">
                <span className="font-bold text-primary-500">1.</span>
                Open your email inbox
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary-500">2.</span>
                Look for an email from <strong>AFCON 2025 Predictor</strong>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary-500">3.</span>
                Click the verification link inside
              </li>
            </ol>
          </div>

          {/* Spam notice */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
            <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-500 mb-1">Can&apos;t find the email?</p>
              <p className="text-[var(--muted)]">
                Check your <strong>spam</strong> or <strong>junk</strong> folder. 
                Sometimes emails end up there by mistake.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link 
              href="/resend-verification" 
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Resend Verification Email
            </Link>
            
            <Link 
              href="/login" 
              className="block text-sm text-[var(--muted)] hover:text-primary-500 transition-colors"
            >
              Already verified? Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted)] mt-6">
          Having trouble?{" "}
          <a href="mailto:afcon.2025mar@gmail.com" className="text-primary-500 hover:underline">
            Contact support
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <GiSoccerBall className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
