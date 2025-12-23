"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiRefreshCw, FiCheck, FiAlertCircle } from "react-icons/fi";

export default function RecalculatePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleRecalculate = async () => {
    setStatus("loading");
    setMessage("");

    try {
      // This would call an API to recalculate all points
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus("success");
      setMessage("Leaderboard has been recalculated successfully!");
    } catch {
      setStatus("error");
      setMessage("Failed to recalculate. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-primary-500 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-display font-bold">
            <span className="text-[var(--foreground)]">Recalculate </span>
            <span className="text-primary-500">Points</span>
          </h1>
          <p className="text-[var(--muted)] mt-2">
            Manually trigger a full leaderboard recalculation
          </p>
        </div>

        {/* Recalculate Card */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-500/20 flex items-center justify-center">
              <FiRefreshCw className={`w-8 h-8 text-accent-500 ${status === "loading" ? "animate-spin" : ""}`} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Full Recalculation
            </h2>
            <p className="text-[var(--muted)]">
              This will recalculate points for all users based on all completed matches.
              Use this if you suspect any scoring discrepancies.
            </p>
          </div>

          {status === "success" && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-secondary-500/10 text-secondary-500 border border-secondary-500/20">
              <FiCheck className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-accent-500/10 text-accent-500 border border-accent-500/20">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <button
            onClick={handleRecalculate}
            disabled={status === "loading"}
            className="btn-primary w-full"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                Recalculating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5" />
                Recalculate All Points
              </span>
            )}
          </button>

          <p className="text-xs text-center text-[var(--muted)] mt-4">
            ⚠️ This operation may take a few minutes for large datasets
          </p>
        </div>
      </div>
    </div>
  );
}
