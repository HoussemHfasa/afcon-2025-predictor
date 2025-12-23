"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiClock, FiMapPin, FiCheck, FiX } from "react-icons/fi";
import { formatDate, formatRelativeTime, formatMatchTime, getUserTimezone } from "@/lib/utils";
import { formatMatchStatus, getStatusColor } from "@/lib/scoring";
import { useTranslation } from "@/lib/i18n";
import { Countdown } from "./Countdown";
import { LiveMatchMinute } from "./LiveMatchMinute";
import type { Match, Team } from "@prisma/client";

interface PredictionData {
  isCorrect: boolean | null;
  pointsEarned: number;
  predictedWinner: string;
  predictedScoreA: number | null;
  predictedScoreB: number | null;
}

interface MatchCardProps {
  match: Match & {
    teamA: Team;
    teamB: Team;
  };
  prediction?: PredictionData;
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const { t } = useTranslation();
  const isLive = match.status === "LIVE";
  const isCompleted = match.status === "COMPLETED";
  const isUpcoming = match.status === "UPCOMING";
  
  const hasPrediction = !!prediction;
  const hasBonus = prediction?.pointsEarned === 4;

  // Determine badge to show
  const getBadge = () => {
    if (!prediction) return null;
    
    // For completed matches, show result
    if (isCompleted && prediction.isCorrect !== null) {
      if (prediction.isCorrect) {
        return (
          <div className={`absolute -top-2 -right-2 z-10 ${hasBonus ? 'bg-gradient-to-r from-secondary-500 to-primary-500' : 'bg-secondary-500'} text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
            <FiCheck className="w-3 h-3" />
            +{prediction.pointsEarned} {hasBonus && '🔥'}
          </div>
        );
      } else {
        return (
          <div className="absolute -top-2 -right-2 z-10 bg-accent-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <FiX className="w-3 h-3" />
            0
          </div>
        );
      }
    }
    
    // For upcoming/live matches, show "Predicted" badge
    return (
      <div className="absolute -top-2 -right-2 z-10 bg-secondary-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <FiCheck className="w-3 h-3" />
        {t("matches.predicted")}
      </div>
    );
  };

  // Get ring color based on result
  const getRingClass = () => {
    if (!prediction) return "";
    if (isCompleted && prediction.isCorrect !== null) {
      return prediction.isCorrect 
        ? hasBonus 
          ? "ring-2 ring-primary-500/50" 
          : "ring-2 ring-secondary-500/30"
        : "ring-2 ring-accent-500/30";
    }
    return "ring-2 ring-secondary-500/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-full"
    >
      {/* Badge */}
      {getBadge()}
      
      <Link href={`/matches/${match.id}`} className="h-full">
        <div className={`match-card h-full flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isLive ? "match-live" : ""} ${getRingClass()}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <FiClock className="w-4 h-4" />
              {isUpcoming ? (
                <span>{formatDate(match.matchDate)}</span>
              ) : (
                <span>{formatDate(match.matchDate, { weekday: undefined })}</span>
              )}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
              {isLive ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  Live
                </span>
              ) : (
                formatMatchStatus(match.status)
              )}
            </div>
          </div>

          {/* Teams */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              {/* Team A */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-12 relative mb-2">
                  {match.teamA.flagUrl ? (
                    <Image
                      src={match.teamA.flagUrl}
                      alt={match.teamA.name}
                      fill
                      className="object-contain rounded-md shadow-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--muted-bg)] rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-[var(--muted)]">
                        {match.teamA.shortName.slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-center">
                  {match.teamA.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {match.teamA.shortName}
                </p>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center">
                {isCompleted || isLive ? (
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-bold ${isLive ? "text-accent-500" : "text-[var(--foreground)]"}`}>
                      {match.scoreA ?? 0}
                    </span>
                    <span className="text-[var(--muted)]">-</span>
                    <span className={`text-3xl font-bold ${isLive ? "text-accent-500" : "text-[var(--foreground)]"}`}>
                      {match.scoreB ?? 0}
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[var(--muted)]">VS</div>
                )}
                {isLive && (
                  <LiveMatchMinute matchDate={match.matchDate} matchId={match.id} status={match.status} />
                )}
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-12 relative mb-2">
                  {match.teamB.flagUrl ? (
                    <Image
                      src={match.teamB.flagUrl}
                      alt={match.teamB.name}
                      fill
                      className="object-contain rounded-md shadow-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--muted-bg)] rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-[var(--muted)]">
                        {match.teamB.shortName.slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-center">
                  {match.teamB.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {match.teamB.shortName}
                </p>
              </div>
            </div>

            {/* Countdown for upcoming OR spacer for others */}
            {isUpcoming ? (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                <Countdown targetDate={match.matchDate} />
              </div>
            ) : (
              <div className="mt-4 pt-4 min-h-[60px]"></div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[var(--muted-bg)] px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <FiMapPin className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{match.venue}</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <span>{formatMatchTime(match.matchDate)}</span>
              <span className="text-xs bg-[var(--card-border)] px-2 py-0.5 rounded">
                {getUserTimezone()}
              </span>
              <span className="text-xs uppercase font-medium">
                {match.stage === "GROUP" && match.groupName
                  ? `GROUP ${match.groupName}`
                  : match.stage.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
