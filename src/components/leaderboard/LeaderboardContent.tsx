"use client";

import { useTranslation } from "@/lib/i18n";
import { FiTrendingUp, FiAward, FiUsers } from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import { LeaderboardTable } from "./LeaderboardTable";

interface LeaderboardUser {
  id: string;
  username: string;
  profilePic: string | null;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  currentStreak: number;
  rank: number;
  accuracy: number;
}

interface Stats {
  totalUsers: number;
  totalPredictions: number;
  completedMatches: number;
}

interface LeaderboardContentProps {
  leaderboard: LeaderboardUser[];
  stats: Stats;
}

export function LeaderboardContent({ leaderboard, stats }: LeaderboardContentProps) {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <GiTrophy className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-500">
              {t("leaderboard.topPredictors")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-[var(--foreground)]">
              {language === "fr" ? "Tableau des " : "Global "}
            </span>
            <span className="text-primary-500">{t("leaderboard.title")}</span>
          </h1>
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            {language === "fr" 
              ? "Voyez comment vous vous classez parmi les pronostiqueurs du monde entier."
              : "See how you rank against predictors from around the world."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="card p-6 text-center">
            <FiUsers className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {language === "fr" ? "Joueurs" : "Players"}
            </div>
          </div>
          <div className="card p-6 text-center">
            <FiAward className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.totalPredictions}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {t("leaderboard.predictions")}
            </div>
          </div>
          <div className="card p-6 text-center">
            <FiTrendingUp className="w-8 h-8 text-accent-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.completedMatches}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {language === "fr" ? "Matchs Terminés" : "Completed Matches"}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable users={leaderboard} />
      </div>
    </div>
  );
}
