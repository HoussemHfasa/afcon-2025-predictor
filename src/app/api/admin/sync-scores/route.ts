import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { footballAPI, STATUS_MAP } from "@/lib/football-api";

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check if we can make API requests
    if (!footballAPI.canMakeRequest()) {
      return NextResponse.json(
        { 
          error: "Daily API limit reached",
          usage: footballAPI.getUsageStats(),
        },
        { status: 429 }
      );
    }

    const { mode = "live" } = await request.json().catch(() => ({}));

    let fixtures;
    if (mode === "all") {
      // Fetch all fixtures (uses more of daily limit)
      fixtures = await footballAPI.getAllFixtures();
    } else if (mode === "today") {
      // Fetch today's fixtures
      const today = new Date().toISOString().split("T")[0];
      fixtures = await footballAPI.getFixturesByDate(today);
    } else {
      // Default: fetch only live matches (most efficient)
      fixtures = await footballAPI.getLiveFixtures();
    }

    if (!fixtures || fixtures.length === 0) {
      return NextResponse.json({
        message: "No matches found to sync",
        matchesChecked: 0,
        matchesUpdated: 0,
        usage: footballAPI.getUsageStats(),
      });
    }

    let matchesUpdated = 0;
    const errors: string[] = [];
    const pointsCalculated: string[] = [];

    for (const fixture of fixtures) {
      try {
        const homeTeamName = fixture.teams.home.name;
        const awayTeamName = fixture.teams.away.name;
        const apiStatus = fixture.fixture.status.short;
        const newStatus = footballAPI.mapStatus(apiStatus);
        const scoreA = fixture.goals.home ?? 0;
        const scoreB = fixture.goals.away ?? 0;

        // Find the match in our database by team names and date
        const matchDate = new Date(fixture.fixture.date);
        const startOfDay = new Date(matchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(matchDate);
        endOfDay.setHours(23, 59, 59, 999);

        const match = await prisma.match.findFirst({
          where: {
            matchDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
            OR: [
              {
                teamA: { name: { contains: homeTeamName.split(" ")[0] } },
                teamB: { name: { contains: awayTeamName.split(" ")[0] } },
              },
              {
                teamA: { shortName: homeTeamName.substring(0, 3).toUpperCase() },
                teamB: { shortName: awayTeamName.substring(0, 3).toUpperCase() },
              },
            ],
          },
          include: {
            teamA: true,
            teamB: true,
          },
        });

        if (!match) {
          console.log(`⚠️ Match not found: ${homeTeamName} vs ${awayTeamName}`);
          continue;
        }

        const wasNotCompleted = match.status !== "COMPLETED";
        const isNowCompleted = newStatus === "COMPLETED";

        // Update match
        await prisma.match.update({
          where: { id: match.id },
          data: {
            scoreA,
            scoreB,
            status: newStatus,
          },
        });

        matchesUpdated++;
        console.log(`✅ Updated: ${match.teamA.name} ${scoreA}-${scoreB} ${match.teamB.name} [${newStatus}]`);

        // If match just completed, calculate points!
        if (wasNotCompleted && isNowCompleted) {
          await calculateMatchPoints(match.id);
          pointsCalculated.push(`${match.teamA.name} vs ${match.teamB.name}`);
          console.log(`🏆 Points calculated for: ${match.teamA.name} vs ${match.teamB.name}`);
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        errors.push(error);
        console.error(`❌ Error processing fixture:`, err);
      }
    }

    return NextResponse.json({
      message: "Sync completed",
      matchesChecked: fixtures.length,
      matchesUpdated,
      pointsCalculated,
      errors: errors.length > 0 ? errors : undefined,
      usage: footballAPI.getUsageStats(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status and API usage
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      usage: footballAPI.getUsageStats(),
      canSync: footballAPI.canMakeRequest(),
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}

/**
 * Calculate points for all predictions on a completed match
 */
async function calculateMatchPoints(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  });

  if (!match || match.status !== "COMPLETED") return;

  // Determine actual winner
  let actualWinner: "TEAM_A" | "TEAM_B" | "DRAW";
  if (match.scoreA! > match.scoreB!) {
    actualWinner = "TEAM_A";
  } else if (match.scoreB! > match.scoreA!) {
    actualWinner = "TEAM_B";
  } else {
    actualWinner = "DRAW";
  }

  const actualDiff = match.scoreA! - match.scoreB!;

  for (const prediction of match.predictions) {
    let points = 0;

    // 3 points for correct winner/draw
    if (prediction.predictedWinner === actualWinner) {
      points = 3;

      // +1 bonus for exact score difference
      if (
        prediction.predictedScoreA !== null &&
        prediction.predictedScoreB !== null
      ) {
        const predictedDiff = prediction.predictedScoreA - prediction.predictedScoreB;
        if (predictedDiff === actualDiff) {
          points += 1;
        }
      }
    }

    // Update prediction and user stats
    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        pointsEarned: points,
        isCorrect: points > 0,
      },
    });

    // Update user's total points and correct predictions
    await prisma.user.update({
      where: { id: prediction.userId },
      data: {
        totalPoints: { increment: points },
        correctPredictions: { increment: points > 0 ? 1 : 0 },
      },
    });
  }
}
