"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";

interface CountdownProps {
  targetDate: Date | string;
  compact?: boolean;
  onExpire?: () => void;
}

export function Countdown({ targetDate, compact = false, onExpire }: CountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdown(targetDate);
      setCountdown(newCountdown);
      
      if (newCountdown.isExpired && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (countdown.isExpired) {
    return compact ? null : (
      <div className="text-center text-accent-500 font-semibold">
        Predictions Closed
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-3">
        <CountdownUnit value={countdown.days} label="D" compact />
        <span className="text-[var(--muted)]">:</span>
        <CountdownUnit value={countdown.hours} label="H" compact />
        <span className="text-[var(--muted)]">:</span>
        <CountdownUnit value={countdown.minutes} label="M" compact />
        <span className="text-[var(--muted)]">:</span>
        <CountdownUnit value={countdown.seconds} label="S" compact />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <CountdownUnit value={countdown.days} label="Days" />
      <CountdownUnit value={countdown.hours} label="Hours" />
      <CountdownUnit value={countdown.minutes} label="Minutes" />
      <CountdownUnit value={countdown.seconds} label="Seconds" />
    </div>
  );
}

function CountdownUnit({ 
  value, 
  label, 
  compact = false 
}: { 
  value: number; 
  label: string; 
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-primary-500">
          {String(value).padStart(2, "0")}
        </span>
        <span className="text-xs text-[var(--muted)]">{label}</span>
      </div>
    );
  }

  return (
    <div className="countdown-item min-w-[70px]">
      <span className="countdown-value">{String(value).padStart(2, "0")}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}
