"use client";

import { useState, useEffect, useRef } from "react";

interface LiveMatchMinuteProps {
  matchDate: Date | string;
  matchId: string;
  status: string;
}

/**
 * Calculates and displays the current match minute for LIVE matches.
 * Updates every 30 seconds automatically on the client.
 * Accounts for halftime break (45-60 min = HT).
 * When FT is reached, triggers auto-complete API to mark match COMPLETED.
 */
export function LiveMatchMinute({ matchDate, matchId, status }: LiveMatchMinuteProps) {
  const [minute, setMinute] = useState<string>("LIVE");
  const autoCompleteTriggered = useRef(false);

  useEffect(() => {
    if (status !== "LIVE") {
      setMinute("");
      return;
    }

    const calculateMinute = async () => {
      const start = typeof matchDate === "string" ? new Date(matchDate) : matchDate;
      const now = new Date();
      const elapsedMs = now.getTime() - start.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

      if (elapsedMinutes < 0) {
        setMinute("LIVE");
        return;
      }

      // First half: 0-45 minutes
      if (elapsedMinutes <= 45) {
        setMinute(`${Math.max(1, elapsedMinutes)}'`);
        return;
      }

      // First half stoppage time: 45-48 minutes
      if (elapsedMinutes > 45 && elapsedMinutes <= 48) {
        setMinute(`45+${elapsedMinutes - 45}'`);
        return;
      }

      // Halftime break: 48-63 minutes (15 min break)
      if (elapsedMinutes > 48 && elapsedMinutes <= 63) {
        setMinute("HT");
        return;
      }

      // Second half: 63-108 minutes total
      // Real match time = elapsed - 18 (3 min stoppage + 15 min break)
      const secondHalfTime = elapsedMinutes - 18;
      
      if (secondHalfTime <= 90) {
        setMinute(`${secondHalfTime}'`);
        return;
      }

      // Second half stoppage time (90+)
      if (secondHalfTime > 90 && secondHalfTime <= 95) {
        setMinute(`90+${secondHalfTime - 90}'`);
        return;
      }

      // Match should be completed after this - show FT
      setMinute("FT");

      // Trigger auto-complete if not already triggered
      if (!autoCompleteTriggered.current && elapsedMinutes >= 110) {
        autoCompleteTriggered.current = true;
        try {
          const response = await fetch(`/api/matches/${matchId}/auto-complete`, {
            method: "POST",
          });
          const data = await response.json();
          if (data.completed) {
            console.log(`Match ${matchId} auto-completed with ${data.predictionsProcessed} predictions`);
            // Reload page to show updated status
            window.location.reload();
          }
        } catch (error) {
          console.error("Auto-complete failed:", error);
        }
      }
    };

    // Calculate immediately
    calculateMinute();

    // Update every 30 seconds
    const interval = setInterval(calculateMinute, 30000);

    return () => clearInterval(interval);
  }, [matchDate, matchId, status]);

  if (!minute || status !== "LIVE") {
    return null;
  }

  return (
    <div className="flex flex-col items-center mt-1">
      <span className="text-xs text-accent-500 font-bold animate-pulse">
        {minute === "HT" || minute === "FT" ? minute : `${minute}`}
      </span>
      {minute !== "HT" && minute !== "FT" && (
        <span className="text-[10px] text-accent-500/70">LIVE</span>
      )}
    </div>
  );
}
