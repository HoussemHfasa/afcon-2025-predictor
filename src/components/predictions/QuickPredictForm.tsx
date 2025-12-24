"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiCheck, FiLoader, FiChevronDown, FiChevronUp, FiClock } from "react-icons/fi";

// Helper function to get time remaining until match
function getTimeUntil(matchDate: string): string {
  const now = new Date();
  const match = new Date(matchDate);
  const diff = match.getTime() - now.getTime();
  
  if (diff <= 0) return "Now";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

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

interface Prediction {
  matchId: string;
  predictedWinner: "TEAM_A" | "TEAM_B" | "DRAW";
  predictedScoreA?: number | null;
  predictedScoreB?: number | null;
}

interface QuickPredictFormProps {
  matches: Match[];
}

export function QuickPredictForm({ matches }: QuickPredictFormProps) {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scoreErrors, setScoreErrors] = useState<Map<string, string>>(new Map());

  // Validate that score matches the predicted winner
  const getScoreError = (
    winner: "TEAM_A" | "TEAM_B" | "DRAW" | null,
    scoreA: number | null | undefined,
    scoreB: number | null | undefined,
    match: Match
  ): string | null => {
    if (!winner || scoreA === null || scoreA === undefined || scoreB === null || scoreB === undefined) {
      return null;
    }
    
    if (winner === "TEAM_A" && scoreA <= scoreB) {
      return `Score must show ${match.teamA.shortName} winning`;
    }
    if (winner === "TEAM_B" && scoreB <= scoreA) {
      return `Score must show ${match.teamB.shortName} winning`;
    }
    if (winner === "DRAW" && scoreA !== scoreB) {
      return `Score must be a draw (e.g., ${scoreA}-${scoreA})`;
    }
    
    return null;
  };

  const setPrediction = (matchId: string, winner: "TEAM_A" | "TEAM_B" | "DRAW") => {
    const match = matches.find(m => m.id === matchId);
    
    setPredictions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(matchId);
      newMap.set(matchId, {
        matchId,
        predictedWinner: winner,
        predictedScoreA: existing?.predictedScoreA,
        predictedScoreB: existing?.predictedScoreB,
      });
      
      // Validate if scores exist
      if (match && existing?.predictedScoreA !== undefined && existing?.predictedScoreB !== undefined) {
        const error = getScoreError(winner, existing.predictedScoreA, existing.predictedScoreB, match);
        setScoreErrors(prevErrors => {
          const newErrors = new Map(prevErrors);
          if (error) {
            newErrors.set(matchId, error);
          } else {
            newErrors.delete(matchId);
          }
          return newErrors;
        });
      }
      
      return newMap;
    });
  };

  const setScore = (matchId: string, team: "A" | "B", score: string) => {
    const match = matches.find(m => m.id === matchId);
    
    setPredictions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(matchId);
      if (!existing) return prev;
      
      const scoreNum = score === "" ? null : parseInt(score);
      const otherScore = team === "A" ? existing.predictedScoreB : existing.predictedScoreA;
      
      // Auto-fill 0 for other team if empty
      const newOtherScore = scoreNum !== null && (otherScore === null || otherScore === undefined) ? 0 : otherScore;
      
      const newScoreA = team === "A" ? scoreNum : newOtherScore;
      const newScoreB = team === "B" ? scoreNum : newOtherScore;
      
      newMap.set(matchId, {
        ...existing,
        predictedScoreA: newScoreA,
        predictedScoreB: newScoreB,
      });
      
      // Validate the new scores
      if (match) {
        const error = getScoreError(existing.predictedWinner, newScoreA, newScoreB, match);
        setScoreErrors(prevErrors => {
          const newErrors = new Map(prevErrors);
          if (error) {
            newErrors.set(matchId, error);
          } else {
            newErrors.delete(matchId);
          }
          return newErrors;
        });
      }
      
      return newMap;
    });
  };

  const handleSubmitAll = async () => {
    if (predictions.size === 0) {
      toast.error("No predictions to submit");
      return;
    }

    // Check for any score validation errors
    if (scoreErrors.size > 0) {
      const firstError = Array.from(scoreErrors.values())[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/predictions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions: Array.from(predictions.values()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save predictions");
        return;
      }

      toast.success(`${data.savedCount} predictions saved!`);
      router.push("/predictions");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {matches.map((match, index) => {
        const prediction = predictions.get(match.id);
        const isExpanded = expandedMatch === match.id;

        return (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`card overflow-hidden transition-all ${
              prediction ? "ring-2 ring-secondary-500/30" : ""
            }`}
          >
            {/* Match Row */}
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center">
                {/* Team A */}
                <div className="flex items-center gap-2">
                  {match.teamA.flagUrl && (
                    <Image
                      src={match.teamA.flagUrl}
                      alt={match.teamA.name}
                      width={28}
                      height={28}
                      className="rounded flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8"
                    />
                  )}
                  <div className="min-w-0 overflow-hidden">
                    <div className="font-semibold text-[var(--foreground)] text-xs sm:text-sm truncate">
                      {match.teamA.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--muted)] flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {getTimeUntil(match.matchDate)}
                    </div>
                  </div>
                </div>

                {/* Prediction Buttons - Center Column */}
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setPrediction(match.id, "TEAM_A")}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                      prediction?.predictedWinner === "TEAM_A"
                        ? "bg-secondary-500 text-white"
                        : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    {prediction?.predictedWinner === "TEAM_A" ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      "1"
                    )}
                  </button>
                  <button
                    onClick={() => setPrediction(match.id, "DRAW")}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                      prediction?.predictedWinner === "DRAW"
                        ? "bg-secondary-500 text-white"
                        : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    {prediction?.predictedWinner === "DRAW" ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      "X"
                    )}
                  </button>
                  <button
                    onClick={() => setPrediction(match.id, "TEAM_B")}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                      prediction?.predictedWinner === "TEAM_B"
                        ? "bg-secondary-500 text-white"
                        : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    {prediction?.predictedWinner === "TEAM_B" ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      "2"
                    )}
                  </button>
                  {/* Expand Button */}
                  {prediction && (
                    <button
                      onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                      className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[var(--muted)] hover:text-primary-500 transition-colors"
                      title="Add exact score"
                    >
                      {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Team B */}
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right min-w-0 overflow-hidden">
                    <div className="font-semibold text-[var(--foreground)] text-xs sm:text-sm truncate">
                      {match.teamB.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--muted)]">
                      {match.stage === "GROUP" && match.groupName 
                        ? `Group ${match.groupName}` 
                        : match.stage.replace("_", " ")}
                    </div>
                  </div>
                  {match.teamB.flagUrl && (
                    <Image
                      src={match.teamB.flagUrl}
                      alt={match.teamB.name}
                      width={28}
                      height={28}
                      className="rounded flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Exact Score (Expanded) */}
            <AnimatePresence>
              {isExpanded && prediction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[var(--card-border)] bg-[var(--muted-bg)] p-4"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <label className="text-xs text-[var(--muted)] block mb-1">
                        {match.teamA.shortName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={prediction.predictedScoreA ?? ""}
                        onChange={(e) => setScore(match.id, "A", e.target.value)}
                        className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-xl text-[var(--muted)]">-</span>
                    <div className="text-center">
                      <label className="text-xs text-[var(--muted)] block mb-1">
                        {match.teamB.shortName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={prediction.predictedScoreB ?? ""}
                        onChange={(e) => setScore(match.id, "B", e.target.value)}
                        className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-[var(--muted)] mt-2">
                    +1 bonus point for correct score difference
                  </p>
                  {/* Score-Winner Validation Error */}
                  {scoreErrors.get(match.id) && (
                    <p className="text-sm text-center text-accent-500 mt-2 font-medium">
                      ⚠️ {scoreErrors.get(match.id)}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Submit Button */}
      {matches.length > 0 && (
        <div className="sticky bottom-4 mt-8">
          <button
            onClick={handleSubmitAll}
            disabled={loading || predictions.size === 0 || scoreErrors.size > 0}
            className="btn-primary w-full text-lg py-4 shadow-lg"
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Submit {predictions.size} Prediction{predictions.size !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
