import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PredictionsContent } from "@/components/predictions/PredictionsContent";

export const dynamic = "force-dynamic";

async function getUserPredictions(userId: string) {
  return prisma.prediction.findMany({
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
      match: {
        matchDate: "desc",
      },
    },
  });
}

export default async function PredictionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const predictions = await getUserPredictions(session.user.id);

  // Stats
  const totalPredictions = predictions.length;
  const correctPredictions = predictions.filter((p) => p.isCorrect === true).length;
  const pendingPredictions = predictions.filter((p) => p.isCorrect === null).length;
  const totalPoints = predictions.reduce((sum, p) => sum + p.pointsEarned, 0);

  // Serialize for client component
  const serializedPredictions = predictions.map(p => ({
    id: p.id,
    predictedWinner: p.predictedWinner,
    predictedScoreA: p.predictedScoreA,
    predictedScoreB: p.predictedScoreB,
    pointsEarned: p.pointsEarned,
    isCorrect: p.isCorrect,
    match: {
      id: p.match.id,
      matchDate: p.match.matchDate.toISOString(),
      status: p.match.status,
      scoreA: p.match.scoreA,
      scoreB: p.match.scoreB,
      stage: p.match.stage,
      groupName: p.match.groupName,
      teamA: {
        shortName: p.match.teamA.shortName,
      },
      teamB: {
        shortName: p.match.teamB.shortName,
      },
    },
  }));

  return (
    <PredictionsContent 
      predictions={serializedPredictions} 
      stats={{ totalPredictions, correctPredictions, pendingPredictions, totalPoints }}
    />
  );
}
