import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MatchesContent } from "@/components/matches/MatchesContent";

export const dynamic = "force-dynamic";

async function getMatches(status?: string, stage?: string) {
  const where: Record<string, unknown> = {};
  
  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }
  
  if (stage && stage !== "all") {
    where.stage = stage.toUpperCase().replace("-", "_");
  }
  
  const matches = await prisma.match.findMany({
    where,
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      matchDate: "asc",
    },
  });
  
  return matches;
}

// Get user predictions with results
async function getUserPredictions(userId: string) {
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    select: { 
      matchId: true,
      isCorrect: true,
      pointsEarned: true,
      predictedWinner: true,
      predictedScoreA: true,
      predictedScoreB: true,
    },
  });
  
  // Create a map for easy lookup
  const predictionMap: Record<string, {
    isCorrect: boolean | null;
    pointsEarned: number;
    predictedWinner: string;
    predictedScoreA: number | null;
    predictedScoreB: number | null;
  }> = {};
  
  for (const p of predictions) {
    predictionMap[p.matchId] = {
      isCorrect: p.isCorrect,
      pointsEarned: p.pointsEarned,
      predictedWinner: p.predictedWinner,
      predictedScoreA: p.predictedScoreA,
      predictedScoreB: p.predictedScoreB,
    };
  }
  
  return predictionMap;
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; stage?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const matches = await getMatches(resolvedSearchParams.status, resolvedSearchParams.stage);
  
  // Get user's predictions with results
  const session = await getServerSession(authOptions);
  const userPredictions = session?.user?.id 
    ? await getUserPredictions(session.user.id)
    : {};
  
  // Serialize for client component
  const serializedMatches = matches.map(m => ({
    id: m.id,
    matchDate: m.matchDate.toISOString(),
    status: m.status,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
    venue: m.venue,
    stage: m.stage,
    groupName: m.groupName,
    teamA: {
      id: m.teamA.id,
      name: m.teamA.name,
      shortName: m.teamA.shortName,
      flagUrl: m.teamA.flagUrl,
      group: m.teamA.group,
    },
    teamB: {
      id: m.teamB.id,
      name: m.teamB.name,
      shortName: m.teamB.shortName,
      flagUrl: m.teamB.flagUrl,
      group: m.teamB.group,
    },
  }));

  return (
    <MatchesContent 
      matches={serializedMatches} 
      userPredictions={userPredictions}
    />
  );
}
