"use client";

import Link from "next/link";
import { FiZap, FiArrowLeft } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";
import { useTranslation } from "@/lib/i18n";
import { QuickPredictForm } from "./QuickPredictForm";

interface Match {
  id: string;
  matchDate: string;
  venue: string;
  stage: string;
  groupName: string | null;
  teamA: {
    name: string;
    shortName: string;
    flagUrl: string | null;
  };
  teamB: {
    name: string;
    shortName: string;
    flagUrl: string | null;
  };
}

interface QuickPredictContentProps {
  matches: Match[];
}

export function QuickPredictContent({ matches }: QuickPredictContentProps) {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-primary-500 transition-colors mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          {t("predictions.quickPredict.backToMatches")}
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/20 mb-4">
            <FiZap className="w-4 h-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-500">
              {t("predictions.quickPredict.title")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-[var(--foreground)]">
              {language === "fr" ? "Prédire " : "Predict "}
            </span>
            <span className="text-secondary-500">
              {language === "fr" ? "Tous les Matchs" : "All Matches"}
            </span>
          </h1>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            {t("predictions.quickPredict.description")}
          </p>
        </div>

        {/* Stats */}
        {matches.length > 0 && (
          <div className="card p-4 mb-8 text-center">
            <div className="text-2xl font-bold text-primary-500">{matches.length}</div>
            <div className="text-sm text-[var(--muted)]">
              {t("predictions.quickPredict.matchesAwaiting")}
            </div>
          </div>
        )}

        {/* No Matches */}
        {matches.length === 0 ? (
          <div className="text-center py-16 card">
            <GiSoccerBall className="w-16 h-16 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {t("predictions.quickPredict.allCaughtUp")}
            </h3>
            <p className="text-[var(--muted)] mb-6">
              {t("predictions.quickPredict.allCaughtUpDesc")}
            </p>
            <Link href="/predictions" className="btn-primary inline-flex">
              {t("predictions.quickPredict.viewPredictions")}
            </Link>
          </div>
        ) : (
          <QuickPredictForm matches={matches} />
        )}
      </div>
    </div>
  );
}
