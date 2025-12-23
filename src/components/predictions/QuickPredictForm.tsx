"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiCheck, FiLoader, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

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

  const setPrediction = (matchId: string, winner: "TEAM_A" | "TEAM_B" | "DRAW") => {
    setPredictions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(matchId);
      newMap.set(matchId, {
        matchId,
        predictedWinner: winner,
        predictedScoreA: existing?.predictedScoreA,
        predictedScoreB: existing?.predictedScoreB,
      });
      return newMap;
    });
  };

  const setScore = (matchId: string, team: "A" | "B", score: string) => {
    setPredictions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(matchId);
      if (!existing) return prev;
      
      const scoreNum = score === "" ? null : parseInt(score);
      const otherTeam = team === "A" ? "B" : "A";
      const otherScore = team === "A" ? existing.predictedScoreB : existing.predictedScoreA;
      
      // Auto-fill 0 for other team if empty
      const newOtherScore = scoreNum !== null && otherScore === null ? 0 : otherScore;
      
      newMap.set(matchId, {
        ...existing,
        predictedScoreA: team === "A" ? scoreNum : newOtherScore,
        predictedScoreB: team === "B" ? scoreNum : newOtherScore,
      });
      return newMap;
    });
  };

  const handleSubmitAll = async () => {
    if (predictions.size === 0) {
      toast.error("No predictions to submit");
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
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Team A */}
                <div className="flex-1 flex items-center gap-3">
                  {match.teamA.flagUrl && (
                    <Image
                      src={match.teamA.flagUrl}
                      alt={match.teamA.name}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-[var(--foreground)] text-sm">
                      {match.teamA.shortName}
                    </div>
                    <div className="text-xs text-[var(--muted)] hidden sm:block">
                      {match.teamA.name}
                    </div>
                  </div>
                </div>

                {/* Prediction Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrediction(match.id, "TEAM_A")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
                </div>

                {/* Team B */}
                <div className="flex-1 flex items-center justify-end gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-[var(--foreground)] text-sm">
                      {match.teamB.shortName}
                    </div>
                    <div className="text-xs text-[var(--muted)] hidden sm:block">
                      {match.teamB.name}
                    </div>
                  </div>
                  {match.teamB.flagUrl && (
                    <Image
                      src={match.teamB.flagUrl}
                      alt={match.teamB.name}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  )}
                </div>

                {/* Expand Button */}
                {prediction && (
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                    className="p-2 text-[var(--muted)] hover:text-primary-500 transition-colors"
                    title="Add exact score"
                  >
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                )}
              </div>

              {/* Match Info */}
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{formatDate(match.matchDate, { hour: undefined, minute: undefined })}</span>
                <span className="uppercase">
                  {match.stage === "GROUP" && match.groupName 
                    ? `GROUP ${match.groupName}` 
                    : match.stage.replace("_", " ")}
                </span>
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
            disabled={loading || predictions.size === 0}
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
