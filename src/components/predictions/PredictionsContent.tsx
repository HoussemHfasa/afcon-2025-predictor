"use client";

import React from "react";

import Link from "next/link";
import { FiTarget, FiCheck, FiX, FiClock, FiCalendar } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";
import { useTranslation } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { CancelPredictionButton } from "./CancelPredictionButton";

interface Prediction {
  id: string;
  predictedWinner: string;
  predictedScoreA: number | null;
  predictedScoreB: number | null;
  pointsEarned: number;
  isCorrect: boolean | null;
  match: {
    id: string;
    matchDate: string;
    status: string;
    scoreA: number | null;
    scoreB: number | null;
    stage: string;
    groupName: string | null;
    teamA: { shortName: string };
    teamB: { shortName: string };
  };
}

interface Stats {
  totalPredictions: number;
  correctPredictions: number;
  pendingPredictions: number;
  totalPoints: number;
}

interface PredictionsContentProps {
  predictions: Prediction[];
  stats: Stats;
}

export function PredictionsContent({ predictions: initialPredictions, stats }: PredictionsContentProps) {
  const { t, language } = useTranslation();
  const [predictions, setPredictions] = React.useState(initialPredictions);

  const handleCancel = (predictionId: string) => {
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <FiTarget className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-500">
              {t("predictions.title")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-[var(--foreground)]">
              {language === "fr" ? "Historique des " : "Prediction "}
            </span>
            <span className="text-primary-500">
              {language === "fr" ? "Pronostics" : "History"}
            </span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-primary-500">{stats.totalPoints}</div>
            <div className="text-sm text-[var(--muted)]">
              {language === "fr" ? "Points Totaux" : "Total Points"}
            </div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-secondary-500">{stats.correctPredictions}</div>
            <div className="text-sm text-[var(--muted)]">
              {t("predictions.correct")}
            </div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">{stats.totalPredictions}</div>
            <div className="text-sm text-[var(--muted)]">
              {language === "fr" ? "Total" : "Total"}
            </div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingPredictions}</div>
            <div className="text-sm text-[var(--muted)]">
              {t("predictions.pending")}
            </div>
          </div>
        </div>

        {/* Predictions List */}
        {predictions.length === 0 ? (
          <div className="text-center py-16 card">
            <GiSoccerBall className="w-16 h-16 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {t("predictions.noPredictions")}
            </h3>
            <p className="text-[var(--muted)] mb-6">
              {language === "fr" 
                ? "Commencez à prédire les résultats des matchs pour gagner des points !"
                : "Start predicting match results to earn points!"}
            </p>
            <Link href="/matches" className="btn-primary inline-flex">
              {language === "fr" ? "Voir les Matchs" : "View Matches"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const match = prediction.match;
              const isCompleted = match.status === "COMPLETED";
              const isCorrect = prediction.isCorrect;
              const hasBonus = prediction.pointsEarned === 4;

              return (
                <div
                  key={prediction.id}
                  className="card p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <Link href={`/matches/${match.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                      <div className="text-center min-w-[80px]">
                        <div className="font-semibold text-[var(--foreground)]">
                          {match.teamA.shortName}
                        </div>
                        {isCompleted && (
                          <div className="text-2xl font-bold text-[var(--foreground)]">
                            {match.scoreA}
                          </div>
                        )}
                      </div>
                      <div className="text-[var(--muted)] text-sm">vs</div>
                      <div className="text-center min-w-[80px]">
                        <div className="font-semibold text-[var(--foreground)]">
                          {match.teamB.shortName}
                        </div>
                        {isCompleted && (
                          <div className="text-2xl font-bold text-[var(--foreground)]">
                            {match.scoreB}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="text-center">
                      <div className="text-xs text-[var(--muted)] mb-1">
                        {t("predictions.yourPrediction")}
                      </div>
                      <div className="font-semibold text-primary-500">
                        {prediction.predictedWinner === "TEAM_A"
                          ? match.teamA.shortName
                          : prediction.predictedWinner === "TEAM_B"
                          ? match.teamB.shortName
                          : language === "fr" ? "Nul" : "Draw"}
                        {prediction.predictedScoreA !== null && (
                          <span className="text-[var(--muted)] ml-2">
                            ({prediction.predictedScoreA}-{prediction.predictedScoreB})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <FiCheck className="w-5 h-5 text-secondary-500" />
                              <span className="font-bold text-secondary-500">
                                +{prediction.pointsEarned}
                                {hasBonus && " 🔥"}
                              </span>
                            </>
                          ) : (
                            <>
                              <FiX className="w-5 h-5 text-accent-500" />
                              <span className="font-bold text-accent-500">0</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <FiClock className="w-4 h-4" />
                            <span className="text-sm">{t("predictions.pending")}</span>
                          </div>
                          <CancelPredictionButton
                            predictionId={prediction.id}
                            matchDate={new Date(match.matchDate)}
                            onCancel={() => handleCancel(prediction.id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-sm text-[var(--muted)]">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(match.matchDate)}
                    </div>
                    <span className="uppercase text-xs">
                      {match.stage === "GROUP" && match.groupName 
                        ? `GROUP ${match.groupName}` 
                        : match.stage.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

