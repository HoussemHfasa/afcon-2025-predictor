"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCalendar, FiCheck, FiX, FiClock } from "react-icons/fi";
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
    teamA: {
      shortName: string;
    };
    teamB: {
      shortName: string;
    };
  };
}

interface PredictionsListProps {
  initialPredictions: Prediction[];
}

export function PredictionsList({ initialPredictions }: PredictionsListProps) {
  const [predictions, setPredictions] = useState(initialPredictions);

  const handleCancel = (predictionId: string) => {
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
  };

  return (
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
              {/* Match Info */}
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

              {/* Prediction */}
              <div className="text-center">
                <div className="text-xs text-[var(--muted)] mb-1">Your Prediction</div>
                <div className="font-semibold text-primary-500">
                  {prediction.predictedWinner === "TEAM_A"
                    ? match.teamA.shortName
                    : prediction.predictedWinner === "TEAM_B"
                    ? match.teamB.shortName
                    : "Draw"}
                  {prediction.predictedScoreA !== null && (
                    <span className="text-[var(--muted)] ml-2">
                      ({prediction.predictedScoreA}-{prediction.predictedScoreB})
                    </span>
                  )}
                </div>
              </div>

              {/* Result / Actions */}
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
                      <span className="text-sm">Pending</span>
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

            {/* Footer */}
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
  );
}
