import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FiUsers, FiCalendar, FiTarget, FiSettings, FiAward, FiTrendingUp } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";
import { SendAnnouncementButton } from "@/components/admin/SendAnnouncementButton";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [totalUsers, totalMatches, totalPredictions, completedMatches, upcomingMatches] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
    prisma.prediction.count(),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count({ where: { status: "UPCOMING" } }),
  ]);

  return { totalUsers, totalMatches, totalPredictions, completedMatches, upcomingMatches };
}

async function getRecentMatches() {
  return prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
      _count: {
        select: { predictions: true },
      },
    },
    orderBy: { matchDate: "asc" },
    take: 10,
  });
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const [stats, recentMatches] = await Promise.all([
    getAdminStats(),
    getRecentMatches(),
  ]);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-4">
            <FiSettings className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-accent-500">Admin Panel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="text-[var(--foreground)]">Dashboard </span>
            <span className="text-primary-500">Overview</span>
          </h1>
          <p className="text-[var(--muted)]">
            Manage matches, users, and monitor tournament progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiUsers className="w-5 h-5 text-primary-500" />
              <span className="text-sm text-[var(--muted)]">Users</span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <GiSoccerBall className="w-5 h-5 text-secondary-500" />
              <span className="text-sm text-[var(--muted)]">Matches</span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.totalMatches}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiTarget className="w-5 h-5 text-accent-500" />
              <span className="text-sm text-[var(--muted)]">Predictions</span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.totalPredictions.toLocaleString()}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiAward className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-[var(--muted)]">Completed</span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.completedMatches}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiCalendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-[var(--muted)]">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {stats.upcomingMatches}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <Link href="/admin/matches" className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <FiCalendar className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Manage Matches
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Add results, update scores, and manage match status.
            </p>
          </Link>

          <Link href="/admin/sync" className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-secondary-500/30">
            <FiTrendingUp className="w-8 h-8 text-secondary-500 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Auto Sync Scores ⚡
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Fetch live scores from API-Football automatically.
            </p>
          </Link>

          <Link href="/admin/users" className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <FiUsers className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-[var(--muted)]">
              View user accounts, manage permissions, and handle bans.
            </p>
          </Link>

          <Link href="/admin/recalculate" className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <FiAward className="w-8 h-8 text-accent-500 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Recalculate Points
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Manually trigger leaderboard recalculation.
            </p>
          </Link>

          <SendAnnouncementButton />
        </div>

        {/* Recent Matches */}
        <div className="card">
          <div className="p-6 border-b border-[var(--card-border)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Recent Matches
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--muted-bg)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase">Match</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Predictions</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match) => (
                  <tr key={match.id} className="border-b border-[var(--card-border)]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--foreground)]">
                        {match.teamA.shortName} vs {match.teamB.shortName}
                      </div>
                      <div className="text-sm text-[var(--muted)]">{match.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {match.status === "COMPLETED" ? (
                        <span className="font-bold text-[var(--foreground)]">
                          {match.scoreA} - {match.scoreB}
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${
                        match.status === "COMPLETED" ? "badge-secondary" :
                        match.status === "LIVE" ? "badge-accent" : "badge-primary"
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--foreground)]">
                      {match._count.predictions}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/matches/${match.id}`}
                        className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
