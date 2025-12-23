import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    
    // Get the match
    const match = await prisma.match.findUnique({
      where: { id: resolvedParams.id },
      include: { predictions: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.scoreA === null || match.scoreB === null) {
      return NextResponse.json(
        { error: "Match scores not set" },
        { status: 400 }
      );
    }

    // Calculate points for each prediction
    const updates = [];
    for (const prediction of match.predictions) {
      const result = calculatePoints(
        prediction.predictedWinner,
        prediction.predictedScoreA,
        prediction.predictedScoreB,
        match.scoreA,
        match.scoreB
      );

      // Update prediction
      updates.push(
        prisma.prediction.update({
          where: { id: prediction.id },
          data: {
            pointsEarned: result.points,
            isCorrect: result.isCorrect,
          },
        })
      );

      // Update user stats
      updates.push(
        prisma.user.update({
          where: { id: prediction.userId },
          data: {
            totalPoints: { increment: result.points },
            correctPredictions: { increment: result.isCorrect ? 1 : 0 },
            currentStreak: result.isCorrect
              ? { increment: 1 }
              : 0,
          },
        })
      );
    }

    await prisma.$transaction(updates);

    // Update user ranks
    const users = await prisma.user.findMany({
      orderBy: [
        { totalPoints: "desc" },
        { correctPredictions: "desc" },
      ],
    });

    for (let i = 0; i < users.length; i++) {
      await prisma.user.update({
        where: { id: users[i].id },
        data: { currentRank: i + 1 },
      });
    }

    return NextResponse.json({
      message: "Points calculated successfully",
      predictionsUpdated: match.predictions.length,
    });
  } catch (error) {
    console.error("Calculate points error:", error);
    return NextResponse.json(
      { error: "Failed to calculate points" },
      { status: 500 }
    );
  }
}
