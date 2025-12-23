"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "@/lib/i18n";

export function HeroCTA() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  // Show skeleton while loading
  if (status === "loading") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <div className="w-48 h-14 bg-primary-500/20 rounded-xl animate-pulse" />
        <div className="w-40 h-14 bg-[var(--muted-bg)] rounded-xl animate-pulse" />
      </div>
    );
  }

  // Logged in - show different CTA
  if (session) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <Link href="/matches" className="btn-primary text-lg px-8 py-4">
          {t("home.startPredicting")}
          <FiArrowRight className="w-5 h-5" />
        </Link>
        <Link href="/predictions" className="btn-outline text-lg px-8 py-4">
          {t("home.viewPredictions")}
        </Link>
      </div>
    );
  }

  // Not logged in - show register/login
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <Link href="/register" className="btn-primary text-lg px-8 py-4">
        {t("home.startPredicting")}
        <FiArrowRight className="w-5 h-5" />
      </Link>
      <Link href="/matches" className="btn-outline text-lg px-8 py-4">
        {t("home.viewMatches")}
      </Link>
    </div>
  );
}

