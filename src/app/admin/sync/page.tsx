"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft, FiRefreshCw, FiWifi, FiCheck, FiAlertCircle, FiZap, FiClock } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

interface SyncResult {
  matchesChecked: number;
  matchesUpdated: number;
  pointsCalculated?: string[];
  errors?: string[];
  usage: {
    used: number;
    remaining: number;
    limit: number;
    date: string;
  };
  timestamp: string;
}

interface APIUsage {
  usage: {
    used: number;
    remaining: number;
    limit: number;
    date: string;
  };
  canSync: boolean;
}

export default function SyncPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [usage, setUsage] = useState<APIUsage | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"live" | "today" | "all">("live");

  // Fetch API usage on mount
  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/admin/sync-scores");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      console.error("Failed to fetch usage");
    }
  };

  const handleSync = async () => {
    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/sync-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setResult(data);
        setUsage({ usage: data.usage, canSync: data.usage.remaining > 0 });
      } else {
        setStatus("error");
        setError(data.error || "Sync failed");
        if (data.usage) {
          setUsage({ usage: data.usage, canSync: data.usage.remaining > 0 });
        }
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
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
            <span className="text-[var(--foreground)]">Auto </span>
            <span className="text-primary-500">Sync Scores</span>
          </h1>
          <p className="text-[var(--muted)] mt-2">
            Automatically fetch live match scores from API-Football
          </p>
        </div>

        {/* API Usage Card */}
        {usage && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <FiWifi className="w-5 h-5 text-primary-500" />
                API Usage Today
              </h3>
              <span className="text-sm text-[var(--muted)]">{usage.usage.date}</span>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--muted)]">Requests Used</span>
                <span className="font-medium text-[var(--foreground)]">
                  {usage.usage.used} / {usage.usage.limit}
                </span>
              </div>
              <div className="h-3 bg-[var(--muted-bg)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    usage.usage.used > 80 ? "bg-accent-500" : 
                    usage.usage.used > 50 ? "bg-orange-500" : "bg-secondary-500"
                  }`}
                  style={{ width: `${(usage.usage.used / usage.usage.limit) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {usage.canSync ? (
                <>
                  <FiCheck className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-500">
                    {usage.usage.remaining} requests remaining
                  </span>
                </>
              ) : (
                <>
                  <FiAlertCircle className="w-4 h-4 text-accent-500" />
                  <span className="text-accent-500">
                    Daily limit reached - resets at midnight
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sync Mode Selection */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">Sync Mode</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMode("live")}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === "live" 
                  ? "border-primary-500 bg-primary-500/10" 
                  : "border-[var(--card-border)] hover:border-primary-500/50"
              }`}
            >
              <FiZap className={`w-6 h-6 mx-auto mb-2 ${mode === "live" ? "text-primary-500" : "text-[var(--muted)]"}`} />
              <div className="text-sm font-medium text-[var(--foreground)]">Live Only</div>
              <div className="text-xs text-[var(--muted)]">1 request</div>
            </button>
            <button
              onClick={() => setMode("today")}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === "today" 
                  ? "border-primary-500 bg-primary-500/10" 
                  : "border-[var(--card-border)] hover:border-primary-500/50"
              }`}
            >
              <FiClock className={`w-6 h-6 mx-auto mb-2 ${mode === "today" ? "text-primary-500" : "text-[var(--muted)]"}`} />
              <div className="text-sm font-medium text-[var(--foreground)]">Today&apos;s Games</div>
              <div className="text-xs text-[var(--muted)]">1 request</div>
            </button>
            <button
              onClick={() => setMode("all")}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === "all" 
                  ? "border-primary-500 bg-primary-500/10" 
                  : "border-[var(--card-border)] hover:border-primary-500/50"
              }`}
            >
              <GiSoccerBall className={`w-6 h-6 mx-auto mb-2 ${mode === "all" ? "text-primary-500" : "text-[var(--muted)]"}`} />
              <div className="text-sm font-medium text-[var(--foreground)]">All Matches</div>
              <div className="text-xs text-[var(--muted)]">1 request</div>
            </button>
          </div>
        </div>

        {/* Sync Button */}
        <div className="card p-6">
          <button
            onClick={handleSync}
            disabled={status === "loading" || !usage?.canSync}
            className="btn-primary w-full mb-4"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                Syncing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5" />
                Sync {mode === "live" ? "Live Matches" : mode === "today" ? "Today's Matches" : "All Matches"}
              </span>
            )}
          </button>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-500/10 text-accent-500 border border-accent-500/20">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {status === "success" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary-500/10 text-secondary-500 border border-secondary-500/20">
                <FiCheck className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Sync completed!</p>
                  <p>Checked {result.matchesChecked} matches, updated {result.matchesUpdated}</p>
                </div>
              </div>

              {result.pointsCalculated && result.pointsCalculated.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <p className="text-sm font-medium text-primary-500 mb-2">
                    🏆 Points calculated for:
                  </p>
                  <ul className="text-sm text-[var(--foreground)]">
                    {result.pointsCalculated.map((match, i) => (
                      <li key={i}>• {match}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-center text-[var(--muted)]">
                Last sync: {new Date(result.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-[var(--muted-bg)] text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)] mb-2">📌 How it works:</p>
          <ul className="space-y-1">
            <li>• <strong>Live Only</strong>: Fetches only currently playing matches (most efficient)</li>
            <li>• <strong>Today&apos;s Games</strong>: Fetches all matches scheduled for today</li>
            <li>• <strong>All Matches</strong>: Fetches entire AFCON schedule (use sparingly)</li>
            <li>• Points are automatically calculated when a match status changes to COMPLETED</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
