import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, calculateAccuracy } from "@/lib/utils";
import { MatchCard } from "@/components/matches/MatchCard";
import { 
  FiTarget, 
  FiAward, 
  FiTrendingUp, 
  FiZap, 
  FiArrowRight,
  FiCalendar
} from "react-icons/fi";
import { GiSoccerBall, GiTrophy } from "react-icons/gi";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  // Get user with stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilePic: true,
      totalPoints: true,
      correctPredictions: true,
      totalPredictions: true,
      currentRank: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  // Get upcoming matches without user predictions
  const upcomingMatches = await prisma.match.findMany({
    where: {
      status: "UPCOMING",
      predictions: {
        none: {
          userId,
        },
      },
    },
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      matchDate: "asc",
    },
    take: 3,
  });

  // Get recent predictions
  const recentPredictions = await prisma.prediction.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          teamA: true,
          teamB: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // Get user rank
  const rank = await prisma.user.count({
    where: {
      totalPoints: {
        gt: user?.totalPoints || 0,
      },
    },
  }) + 1;

  return {
    user: user ? { ...user, currentRank: rank } : null,
    upcomingMatches,
    recentPredictions,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { user, upcomingMatches, recentPredictions } = await getDashboardData(
    session.user.id
  );

  if (!user) {
    redirect("/login");
  }

  const accuracy = calculateAccuracy(user.correctPredictions, user.totalPredictions);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="text-[var(--foreground)]">Welcome back, </span>
            <span className="text-primary-500">{user.username}!</span>
          </h1>
          <p className="text-[var(--muted)]">
            Here&apos;s your prediction dashboard for AFCON 2025.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-primary-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-primary-500" />
              </div>
              <span className="text-sm font-medium text-[var(--muted)]">Total Points</span>
            </div>
            <div className="text-3xl font-bold text-primary-500">{user.totalPoints}</div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-secondary-500/10 to-secondary-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                <GiTrophy className="w-5 h-5 text-secondary-500" />
              </div>
              <span className="text-sm font-medium text-[var(--muted)]">Global Rank</span>
            </div>
            <div className="text-3xl font-bold text-secondary-500">#{user.currentRank}</div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-accent-500/10 to-accent-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-accent-500" />
              </div>
              <span className="text-sm font-medium text-[var(--muted)]">Accuracy</span>
            </div>
            <div className="text-3xl font-bold text-accent-500">{accuracy}%</div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <FiZap className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-[var(--muted)]">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{user.currentStreak}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Matches to Predict */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-primary-500" />
                Matches to Predict
              </h2>
              <Link
                href="/matches?status=upcoming"
                className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1"
              >
                View all <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingMatches.length === 0 ? (
              <div className="card p-8 text-center">
                <GiSoccerBall className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted)]">
                  You&apos;ve predicted all available matches! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Predictions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                <FiTarget className="w-5 h-5 text-primary-500" />
                Recent Predictions
              </h2>
              <Link
                href="/predictions"
                className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1"
              >
                View all <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentPredictions.length === 0 ? (
              <div className="card p-8 text-center">
                <FiTarget className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted)] mb-4">
                  No predictions yet. Start predicting!
                </p>
                <Link href="/matches" className="btn-primary inline-flex">
                  Browse Matches
                </Link>
              </div>
            ) : (
              <div className="card">
                {recentPredictions.map((pred, idx) => {
                  const isCompleted = pred.match.status === "COMPLETED";
                  return (
                    <Link
                      key={pred.id}
                      href={`/matches/${pred.matchId}`}
                      className={`block p-4 hover:bg-primary-500/5 transition-colors ${
                        idx !== recentPredictions.length - 1
                          ? "border-b border-[var(--card-border)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[var(--foreground)]">
                            {pred.match.teamA.shortName} vs {pred.match.teamB.shortName}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            Predicted:{" "}
                            <span className="text-primary-500">
                              {pred.predictedWinner === "TEAM_A"
                                ? pred.match.teamA.shortName
                                : pred.predictedWinner === "TEAM_B"
                                ? pred.match.teamB.shortName
                                : "Draw"}
                            </span>
                          </div>
                        </div>
                        {isCompleted ? (
                          <div
                            className={`font-bold ${
                              pred.isCorrect
                                ? "text-secondary-500"
                                : "text-accent-500"
                            }`}
                          >
                            {pred.isCorrect ? `+${pred.pointsEarned}` : "0"}
                          </div>
                        ) : (
                          <span className="badge badge-primary">Pending</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {user.totalPredictions}
            </div>
            <div className="text-sm text-[var(--muted)]">Total Predictions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-secondary-500">
              {user.correctPredictions}
            </div>
            <div className="text-sm text-[var(--muted)]">Correct</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent-500">
              {user.totalPredictions - user.correctPredictions}
            </div>
            <div className="text-sm text-[var(--muted)]">Incorrect</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {user.longestStreak}
            </div>
            <div className="text-sm text-[var(--muted)]">Best Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
