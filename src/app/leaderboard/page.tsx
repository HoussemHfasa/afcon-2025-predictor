import prisma from "@/lib/prisma";
import { LeaderboardContent } from "@/components/leaderboard/LeaderboardContent";

export const dynamic = "force-dynamic";

async function getLeaderboard(limit: number = 50) {
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
    },
    select: {
      id: true,
      username: true,
      profilePic: true,
      totalPoints: true,
      correctPredictions: true,
      totalPredictions: true,
      currentStreak: true,
    },
    orderBy: [
      { totalPoints: "desc" },
      { correctPredictions: "desc" },
    ],
    take: limit,
  });

  return users.map((user, index) => ({
    ...user,
    rank: index + 1,
    accuracy: user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0,
  }));
}

async function getStats() {
  const totalUsers = await prisma.user.count({
    where: { isAdmin: false },
  });
  const totalPredictions = await prisma.prediction.count();
  const completedMatches = await prisma.match.count({
    where: { status: "COMPLETED" },
  });

  return { totalUsers, totalPredictions, completedMatches };
}

export default async function LeaderboardPage() {
  const [leaderboard, stats] = await Promise.all([
    getLeaderboard(50),
    getStats(),
  ]);

  return <LeaderboardContent leaderboard={leaderboard} stats={stats} />;
}
