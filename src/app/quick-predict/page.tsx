import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuickPredictContent } from "@/components/predictions/QuickPredictContent";

export const dynamic = "force-dynamic";

async function getUnpredictedMatches(userId: string) {
  const now = new Date();
  const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      matchDate: { gt: oneMinuteFromNow },
      NOT: {
        predictions: {
          some: { userId },
        },
      },
    },
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: { matchDate: "asc" },
  });

  return matches;
}

export default async function QuickPredictPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const matches = await getUnpredictedMatches(session.user.id);

  const serializedMatches = matches.map(m => ({
    id: m.id,
    matchDate: m.matchDate.toISOString(),
    venue: m.venue,
    stage: m.stage,
    groupName: m.groupName,
    teamA: {
      name: m.teamA.name,
      shortName: m.teamA.shortName,
      flagUrl: m.teamA.flagUrl,
    },
    teamB: {
      name: m.teamB.name,
      shortName: m.teamB.shortName,
      flagUrl: m.teamB.flagUrl,
    },
  }));

  return <QuickPredictContent matches={serializedMatches} />;
}
