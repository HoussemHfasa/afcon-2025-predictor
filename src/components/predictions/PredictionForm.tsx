"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiCheck, FiLoader, FiLock } from "react-icons/fi";
import type { PredictionType } from "@prisma/client";

interface PredictionFormProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
  matchDate: Date;
  existingPrediction?: {
    predictedWinner: PredictionType;
    predictedScoreA: number | null;
    predictedScoreB: number | null;
  };
  onSuccess?: () => void;
}

export function PredictionForm({
  matchId,
  teamAName,
  teamBName,
  matchDate,
  existingPrediction,
  onSuccess,
}: PredictionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedWinner, setSelectedWinner] = useState<PredictionType | null>(
    existingPrediction?.predictedWinner ?? null
  );
  const [scoreA, setScoreA] = useState<string>(
    existingPrediction?.predictedScoreA?.toString() ?? ""
  );
  const [scoreB, setScoreB] = useState<string>(
    existingPrediction?.predictedScoreB?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [showScores, setShowScores] = useState(
    existingPrediction?.predictedScoreA !== null
  );
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Validate that score matches the predicted winner
  const validateScoreMatchesWinner = (
    winner: PredictionType | null,
    sA: string,
    sB: string
  ): string | null => {
    if (!winner || sA === "" || sB === "") return null;
    
    const numA = parseInt(sA);
    const numB = parseInt(sB);
    
    if (isNaN(numA) || isNaN(numB)) return null;
    
    if (winner === "TEAM_A" && numA <= numB) {
      return `Score must show ${teamAName} winning (e.g., ${numB + 1}-${numB})`;
    }
    if (winner === "TEAM_B" && numB <= numA) {
      return `Score must show ${teamBName} winning (e.g., ${numA}-${numA + 1})`;
    }
    if (winner === "DRAW" && numA !== numB) {
      return `Score must be a draw (e.g., ${numA}-${numA})`;
    }
    
    return null;
  };

  // Auto-fill 0 for the other team when entering a score
  const handleScoreAChange = (value: string) => {
    setScoreA(value);
    if (value && scoreB === "") {
      setScoreB("0");
      setScoreError(validateScoreMatchesWinner(selectedWinner, value, "0"));
    } else {
      setScoreError(validateScoreMatchesWinner(selectedWinner, value, scoreB));
    }
  };

  const handleScoreBChange = (value: string) => {
    setScoreB(value);
    if (value && scoreA === "") {
      setScoreA("0");
      setScoreError(validateScoreMatchesWinner(selectedWinner, "0", value));
    } else {
      setScoreError(validateScoreMatchesWinner(selectedWinner, scoreA, value));
    }
  };

  // Also validate when winner changes
  const handleWinnerChange = (winner: PredictionType) => {
    setSelectedWinner(winner);
    if (scoreA !== "" && scoreB !== "") {
      setScoreError(validateScoreMatchesWinner(winner, scoreA, scoreB));
    }
  };

  // Check if predictions are closed (1 minute before match start)
  const deadline = new Date(matchDate.getTime() - 1 * 60 * 1000);
  const isClosed = new Date() >= deadline;

  if (!session) {
    return (
      <div className="text-center p-6 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
        <FiLock className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--muted)]">
          Please sign in to make predictions
        </p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="text-center p-6 rounded-xl bg-accent-500/10 border border-accent-500/20">
        <FiLock className="w-8 h-8 text-accent-500 mx-auto mb-3" />
        <p className="text-accent-500 font-medium">
          Predictions are closed for this match
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedWinner) {
      toast.error("Please select a prediction");
      return;
    }

    // Check if score matches winner
    if (scoreError) {
      toast.error(scoreError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          predictedWinner: selectedWinner,
          predictedScoreA: scoreA ? parseInt(scoreA) : null,
          predictedScoreB: scoreB ? parseInt(scoreB) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save prediction");
        return;
      }

      toast.success(
        existingPrediction ? "Prediction updated!" : "Prediction saved!"
      );
      router.refresh(); // Refresh to update predicted badges
      onSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Winner Selection */}
      <div>
        <h4 className="text-sm font-medium text-[var(--muted)] mb-3">
          Who will win?
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleWinnerChange("TEAM_A")}
            disabled={loading}
            className={`prediction-option flex flex-col items-center justify-center ${
              selectedWinner === "TEAM_A" ? "selected" : ""
            }`}
          >
            <span className="font-semibold text-[var(--foreground)] block">
              {teamAName}
            </span>
            <span className="text-xs text-[var(--muted)] block mt-1">Win</span>
            {selectedWinner === "TEAM_A" && (
              <FiCheck className="w-5 h-5 text-primary-500 mt-2" />
            )}
          </button>

          <button
            onClick={() => handleWinnerChange("DRAW")}
            disabled={loading}
            className={`prediction-option flex flex-col items-center justify-center ${
              selectedWinner === "DRAW" ? "selected" : ""
            }`}
          >
            <span className="font-semibold text-[var(--foreground)] block">Draw</span>
            <span className="text-xs text-[var(--muted)] block mt-1">Tie</span>
            {selectedWinner === "DRAW" && (
              <FiCheck className="w-5 h-5 text-primary-500 mt-2" />
            )}
          </button>

          <button
            onClick={() => handleWinnerChange("TEAM_B")}
            disabled={loading}
            className={`prediction-option flex flex-col items-center justify-center ${
              selectedWinner === "TEAM_B" ? "selected" : ""
            }`}
          >
            <span className="font-semibold text-[var(--foreground)] block">
              {teamBName}
            </span>
            <span className="text-xs text-[var(--muted)] block mt-1">Win</span>
            {selectedWinner === "TEAM_B" && (
              <FiCheck className="w-5 h-5 text-primary-500 mt-2" />
            )}
          </button>
        </div>
      </div>

      {/* Exact Score (Optional) */}
      <div>
        <button
          onClick={() => setShowScores(!showScores)}
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          {showScores
            ? "Hide exact score (optional)"
            : "+ Predict exact score (+1 bonus point)"}
        </button>

        <AnimatePresence>
          {showScores && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <label className="text-xs text-[var(--muted)] block mb-2">
                    {teamAName}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scoreA}
                    onChange={(e) => handleScoreAChange(e.target.value)}
                    disabled={loading}
                    className="w-16 h-16 text-center text-2xl font-bold rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <span className="text-2xl text-[var(--muted)]">-</span>
                <div className="text-center">
                  <label className="text-xs text-[var(--muted)] block mb-2">
                    {teamBName}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scoreB}
                    onChange={(e) => handleScoreBChange(e.target.value)}
                    disabled={loading}
                    className="w-16 h-16 text-center text-2xl font-bold rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <p className="text-xs text-center text-[var(--muted)] mt-2">
                Predict the correct goal difference for +1 bonus point
              </p>
              {/* Score-Winner Validation Error */}
              {scoreError && (
                <p className="text-sm text-center text-accent-500 mt-3 font-medium">
                  ⚠️ {scoreError}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !selectedWinner || !!scoreError}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : existingPrediction ? (
          "Update Prediction"
        ) : (
          "Submit Prediction"
        )}
      </button>

      {/* Points Info */}
      <div className="text-center text-xs text-[var(--muted)]">
        <span className="text-secondary-500 font-semibold">3 points</span> for correct prediction •{" "}
        <span className="text-primary-500 font-semibold">+1 bonus</span> for exact score difference
      </div>
    </div>
  );
}
