import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { footballAPI } from "@/lib/football-api";

// Vercel Cron Secret - prevents unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel adds this header)
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      console.log("Cron: Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Cron: Starting automatic score sync...");

    // Check API availability
    if (!footballAPI.canMakeRequest()) {
      console.log("Cron: Daily API limit reached, skipping sync");
      return NextResponse.json({
        message: "Daily limit reached, sync skipped",
        usage: footballAPI.getUsageStats(),
      });
    }

    // Fetch live matches first (most efficient)
    let fixtures = await footballAPI.getLiveFixtures();
    
    // If no live matches, check if there are any today
    if (fixtures.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      fixtures = await footballAPI.getFixturesByDate(today);
    }

    if (fixtures.length === 0) {
      console.log("Cron: No matches to sync");
      return NextResponse.json({
        message: "No matches to sync",
        matchesChecked: 0,
        matchesUpdated: 0,
        usage: footballAPI.getUsageStats(),
      });
    }

    let matchesUpdated = 0;
    const pointsCalculated: string[] = [];

    for (const fixture of fixtures) {
      try {
        const homeTeamName = fixture.teams.home.name;
        const awayTeamName = fixture.teams.away.name;
        const apiStatus = fixture.fixture.status.short;
        const newStatus = footballAPI.mapStatus(apiStatus);
        const scoreA = fixture.goals.home ?? 0;
        const scoreB = fixture.goals.away ?? 0;

        // Find match in database
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
            ],
          },
          include: {
            teamA: true,
            teamB: true,
          },
        });

        if (!match) continue;

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

        // Calculate points if match just completed
        if (wasNotCompleted && isNowCompleted) {
          await calculateMatchPoints(match.id);
          pointsCalculated.push(`${match.teamA.name} vs ${match.teamB.name}`);
        }
      } catch (err) {
        console.error("Cron: Error processing fixture:", err);
      }
    }

    return NextResponse.json({
      message: "Cron sync completed",
      matchesChecked: fixtures.length,
      matchesUpdated,
      pointsCalculated,
      usage: footballAPI.getUsageStats(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Cron sync failed" },
      { status: 500 }
    );
  }
}

async function calculateMatchPoints(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  });

  if (!match || match.status !== "COMPLETED") return;

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

    if (prediction.predictedWinner === actualWinner) {
      points = 3;

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

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        pointsEarned: points,
        isCorrect: points > 0,
      },
    });

    await prisma.user.update({
      where: { id: prediction.userId },
      data: {
        totalPoints: { increment: points },
        correctPredictions: { increment: points > 0 ? 1 : 0 },
      },
    });
  }
}
