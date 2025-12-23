"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiCheck } from "react-icons/fi";
import type { MatchStatus } from "@prisma/client";

interface AdminMatchFormProps {
  matchId: string;
  currentScoreA: number | null;
  currentScoreB: number | null;
  currentStatus: MatchStatus;
  teamAName: string;
  teamBName: string;
}

export function AdminMatchForm({
  matchId,
  currentScoreA,
  currentScoreB,
  currentStatus,
  teamAName,
  teamBName,
}: AdminMatchFormProps) {
  const router = useRouter();
  const [scoreA, setScoreA] = useState(currentScoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState(currentScoreB?.toString() ?? "");
  const [status, setStatus] = useState<MatchStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA: scoreA ? parseInt(scoreA) : null,
          scoreB: scoreB ? parseInt(scoreB) : null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update match");
        return;
      }

      toast.success("Match updated successfully!");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Update Score
      </h2>

      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <label className="label">{teamAName}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="w-20 h-20 text-center text-3xl font-bold rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <span className="text-3xl text-[var(--muted)]">-</span>
        <div className="text-center">
          <label className="label">{teamBName}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="w-20 h-20 text-center text-3xl font-bold rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="label">Match Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MatchStatus)}
          className="input"
        >
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
          <option value="POSTPONED">Postponed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>

        {status === "COMPLETED" && scoreA !== "" && scoreB !== "" && (
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch(`/api/admin/matches/${matchId}/calculate`, {
                  method: "POST",
                });
                if (response.ok) {
                  toast.success("Points calculated successfully!");
                } else {
                  toast.error("Failed to calculate points");
                }
              } catch {
                toast.error("Something went wrong");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="btn-secondary"
          >
            <FiCheck className="w-5 h-5" />
            Calculate Points
          </button>
        )}
      </div>
    </form>
  );
}
