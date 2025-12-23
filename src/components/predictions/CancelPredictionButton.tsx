"use client";

import { useState } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

interface CancelPredictionButtonProps {
  predictionId: string;
  matchDate: Date;
  onCancel: () => void;
}

export function CancelPredictionButton({ 
  predictionId, 
  matchDate,
  onCancel 
}: CancelPredictionButtonProps) {
  const [loading, setLoading] = useState(false);

  // Check if cancellation is still allowed (1 hour before match)
  const deadline = new Date(new Date(matchDate).getTime() - 60 * 60 * 1000);
  const canCancel = new Date() < deadline;

  if (!canCancel) {
    return null; // Don't show button if can't cancel
  }

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!confirm("Are you sure you want to cancel this prediction?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/predictions/${predictionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to cancel prediction");
        return;
      }

      toast.success("Prediction cancelled");
      onCancel();
    } catch {
      toast.error("Failed to cancel prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="p-2 text-accent-500 hover:bg-accent-500/10 rounded-lg transition-colors"
      title="Cancel prediction"
    >
      {loading ? (
        <FiLoader className="w-4 h-4 animate-spin" />
      ) : (
        <FiX className="w-4 h-4" />
      )}
    </button>
  );
}
