"use client";

import Link from "next/link";
import { GiSoccerBall } from "react-icons/gi";
import { FiZap } from "react-icons/fi";
import { useTranslation } from "@/lib/i18n";
import { MatchCard } from "./MatchCard";
import { MatchFilters } from "./MatchFilters";

interface Match {
  id: string;
  matchDate: string;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  venue: string;
  stage: string;
  groupName: string | null;
  teamA: {
    id: string;
    name: string;
    shortName: string;
    flagUrl: string | null;
    group: string;
  };
  teamB: {
    id: string;
    name: string;
    shortName: string;
    flagUrl: string | null;
    group: string;
  };
}

interface PredictionData {
  isCorrect: boolean | null;
  pointsEarned: number;
  predictedWinner: string;
  predictedScoreA: number | null;
  predictedScoreB: number | null;
}

interface MatchesContentProps {
  matches: Match[];
  userPredictions: Record<string, PredictionData>;
}

export function MatchesContent({ matches, userPredictions }: MatchesContentProps) {
  const { t, language } = useTranslation();
  
  // Group matches by date
  const groupedMatches = matches.reduce((acc: Record<string, Match[]>, match) => {
    const date = new Date(match.matchDate).toLocaleDateString(
      language === "fr" ? "fr-FR" : "en-US", 
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <GiSoccerBall className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-500">
              52 {t("nav.matches")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-[var(--foreground)]">AFCON 2025 </span>
            <span className="text-primary-500">{t("nav.matches")}</span>
          </h1>
          <p className="text-[var(--muted)] max-w-2xl mx-auto mb-6">
            {language === "fr" 
              ? "Parcourez tous les matchs, faites vos pronostics et suivez les scores en direct tout au long du tournoi."
              : "Browse all matches, make your predictions, and track live scores throughout the tournament."}
          </p>
          <Link
            href="/quick-predict"
            className="btn-secondary inline-flex gap-2"
          >
            <FiZap className="w-5 h-5" />
            {language === "fr" ? "Pronostic Rapide" : "Quick Predict All"}
          </Link>
        </div>

        {/* Filters */}
        <MatchFilters />

        {/* Matches List */}
        {Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-16">
            <GiSoccerBall className="w-16 h-16 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {t("matches.noMatches")}
            </h3>
            <p className="text-[var(--muted)]">
              {language === "fr" 
                ? "Ajustez vos filtres ou revenez plus tard."
                : "Try adjusting your filters or check back later."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).map(([date, dayMatches]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                  {date}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayMatches.map((match) => {
                    const prediction = userPredictions[match.id];
                    return (
                      <MatchCard 
                        key={match.id} 
                        match={match as any} 
                        prediction={prediction}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
