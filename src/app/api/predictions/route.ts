import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { canPredict } from "@/lib/scoring";

const predictionSchema = z.object({
  matchId: z.string(),
  predictedWinner: z.enum(["TEAM_A", "TEAM_B", "DRAW"]),
  predictedScoreA: z.number().min(0).max(20).optional().nullable(),
  predictedScoreB: z.number().min(0).max(20).optional().nullable(),
});

// Create or update a prediction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = predictionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { matchId, predictedWinner, predictedScoreA, predictedScoreB } = result.data;

    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Check if predictions are still open
    if (!canPredict(match.matchDate)) {
      return NextResponse.json(
        { error: "Predictions are closed for this match" },
        { status: 400 }
      );
    }

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId,
        },
      },
      create: {
        userId: session.user.id,
        matchId,
        predictedWinner,
        predictedScoreA,
        predictedScoreB,
      },
      update: {
        predictedWinner,
        predictedScoreA,
        predictedScoreB,
      },
    });

    return NextResponse.json({ prediction }, { status: 200 });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    );
  }
}

// Get user's predictions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (matchId) {
      where.matchId = matchId;
    }

    const predictions = await prisma.prediction.findMany({
      where,
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
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
