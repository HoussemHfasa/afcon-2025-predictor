"use client";

import { getInitials } from "@/lib/utils";
import { FiTrendingUp, FiZap } from "react-icons/fi";
import { GiTrophy, GiMedal } from "react-icons/gi";

interface LeaderboardUser {
  id: string;
  username: string;
  profilePic: string | null;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  currentStreak: number;
  rank: number;
  accuracy: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: string;
}

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  if (users.length === 0) {
    return (
      <div className="card p-12 text-center">
        <GiTrophy className="w-16 h-16 text-[var(--muted)] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          No players yet
        </h3>
        <p className="text-[var(--muted)]">
          Be the first to make predictions and top the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Top 3 */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 border-b border-[var(--card-border)]">
          {/* 2nd Place */}
          <TopPlayer user={users[1]} position={2} />
          {/* 1st Place */}
          <TopPlayer user={users[0]} position={1} />
          {/* 3rd Place */}
          <TopPlayer user={users[2]} position={3} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase tracking-wider hidden md:table-cell">
                Predictions
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase tracking-wider hidden md:table-cell">
                Accuracy
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase tracking-wider hidden lg:table-cell">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {users.slice(3).map((user) => (
              <tr
                key={user.id}
                className={`border-b border-[var(--card-border)] transition-colors hover:bg-primary-500/5 ${
                  user.id === currentUserId ? "bg-primary-500/10" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-[var(--foreground)]">
                    #{user.rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(user.username)}
                    </div>
                    <span className="font-medium text-[var(--foreground)]">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-primary-500">
                    {user.totalPoints}
                  </span>
                </td>
                <td className="px-6 py-4 text-center hidden md:table-cell">
                  <span className="text-secondary-500">
                    {user.correctPredictions}
                  </span>
                  <span className="text-[var(--muted)]">/{user.totalPredictions}</span>
                </td>
                <td className="px-6 py-4 text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <FiTrendingUp className="w-4 h-4 text-[var(--muted)]" />
                    <span className="text-[var(--foreground)]">{user.accuracy}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center hidden lg:table-cell">
                  {user.currentStreak > 0 && (
                    <div className="flex items-center justify-center gap-1 text-orange-500">
                      <FiZap className="w-4 h-4" />
                      <span>{user.currentStreak}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopPlayer({ user, position }: { user: LeaderboardUser; position: number }) {
  const sizes = {
    1: "w-20 h-20",
    2: "w-16 h-16",
    3: "w-16 h-16",
  };

  const colors = {
    1: "from-yellow-400 to-yellow-600",
    2: "from-gray-300 to-gray-500",
    3: "from-orange-400 to-orange-600",
  };

  const orders = {
    1: "order-2",
    2: "order-1",
    3: "order-3",
  };

  const heights = {
    1: "pt-0",
    2: "pt-8",
    3: "pt-8",
  };

  // Tunisian titles for top 3
  const titles = {
    1: { name: "M3alem el Koora", arabic: "معلم الكورة", emoji: "🏆" },
    2: { name: "Wazir", arabic: "وزير", emoji: "👑" },
    3: { name: "Elfahim", arabic: "الفاهم", emoji: "🧠" },
  };

  const title = titles[position as 1 | 2 | 3];

  return (
    <div className={`flex flex-col items-center ${orders[position as 1 | 2 | 3]} ${heights[position as 1 | 2 | 3]}`}>
      <div className="relative mb-3">
        <div
          className={`${sizes[position as 1 | 2 | 3]} rounded-full bg-gradient-to-br ${colors[position as 1 | 2 | 3]} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
        >
          {getInitials(user.username)}
        </div>
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${colors[position as 1 | 2 | 3]} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {position === 1 ? <GiTrophy className="w-4 h-4" /> : <GiMedal className="w-4 h-4" />}
        </div>
      </div>
      <h3 className="font-semibold text-[var(--foreground)] text-center">
        {user.username}
      </h3>
      {/* Tunisian Title */}
      <div className="text-center mt-1">
        <span className="text-xs font-medium text-primary-500">{title.name}</span>
        <span className="ml-1">{title.emoji}</span>
        <div className="text-xs text-[var(--muted)]">{title.arabic}</div>
      </div>
      <div className="text-2xl font-bold text-primary-500 mt-2">{user.totalPoints}</div>
      <div className="text-xs text-[var(--muted)]">points</div>
    </div>
  );
}

