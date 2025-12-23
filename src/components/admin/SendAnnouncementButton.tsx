"use client";

import { useState } from "react";
import { FiMail, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

export function SendAnnouncementButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    totalUsers?: number;
    successCount?: number;
    failCount?: number;
  } | null>(null);

  const handleSend = async () => {
    if (!confirm("Are you sure you want to send the announcement email to ALL users?")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/announcement", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setResult(data);
      toast.success(`Sent ${data.successCount} emails successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send emails");
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 flex items-center justify-center mb-4">
          <FiMail className="w-6 h-6 text-secondary-500" />
        </div>
        <h3 className="font-semibold text-[var(--foreground)] mb-2">
          Send Announcement
        </h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          Email all users about new features
        </p>

        {result && result.success && (
          <div className="mb-4 p-3 rounded-lg bg-secondary-500/10 border border-secondary-500/30 text-sm">
            <FiCheck className="w-4 h-4 text-secondary-500 inline mr-2" />
            Sent to {result.successCount}/{result.totalUsers} users
            {result.failCount ? ` (${result.failCount} failed)` : ""}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <FiMail className="w-4 h-4" />
              Send to All Users
            </>
          )}
        </button>
      </div>
    </div>
  );
}
