"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiArrowRight, FiTarget, FiTrendingUp } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";
import { useTranslation } from "@/lib/i18n";

export function CTASection() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Track if component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render the same thing on server - show loading state
  // This prevents hydration mismatch
  if (!mounted || status === "loading") {
    return (
      <section className="py-24 px-4 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 w-64 mx-auto bg-dark-950/20 rounded animate-pulse mb-6" />
          <div className="h-6 w-96 max-w-full mx-auto bg-dark-950/20 rounded animate-pulse" />
        </div>
      </section>
    );
  }

  // Logged in user - different CTA
  if (session) {
    return (
      <section className="py-24 px-4 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-dark-950 mb-6">
            {t("dashboard.welcome")}, {session.user?.name}! 🎉
          </h2>
          <p className="text-dark-800 text-lg mb-8 max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/matches" 
              className="btn bg-dark-950 text-white hover:bg-dark-800 px-8 py-4 text-lg"
            >
              <GiSoccerBall className="w-5 h-5" />
              {t("home.viewMatches")}
            </Link>
            <Link 
              href="/leaderboard" 
              className="btn bg-white/20 text-dark-950 hover:bg-white/30 px-8 py-4 text-lg"
            >
              <FiTrendingUp className="w-5 h-5" />
              {t("nav.leaderboard")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Not logged in - show registration CTA
  return (
    <section className="py-24 px-4 bg-gradient-to-r from-primary-600 to-primary-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark-950 mb-6">
          {t("home.cta.title")} <span className="text-dark-800">{t("home.cta.titleHighlight")}</span>
        </h2>
        <p className="text-dark-800 text-lg mb-8 max-w-2xl mx-auto">
          {t("home.cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="btn bg-dark-950 text-white hover:bg-dark-800 px-8 py-4 text-lg"
          >
            {t("home.cta.createAccount")}
            <FiArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="btn bg-white/20 text-dark-950 hover:bg-white/30 px-8 py-4 text-lg"
          >
            {t("common.signIn")}
          </Link>
        </div>
        <p className="mt-6 text-dark-800/70 text-sm">
          {t("home.cta.alreadyHaveAccount")} <Link href="/login" className="underline hover:text-dark-950">{t("common.signIn")}</Link>
        </p>
      </div>
    </section>
  );
}

