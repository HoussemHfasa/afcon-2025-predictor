import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get total count (excluding admins)
    const totalCount = await prisma.user.count({
      where: { isAdmin: false },
    });

    // Get leaderboard (excluding admins)
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
        longestStreak: true,
      },
      orderBy: [
        { totalPoints: "desc" },
        { correctPredictions: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
      accuracy: user.totalPredictions > 0 
        ? Math.round((user.correctPredictions / user.totalPredictions) * 100) 
        : 0,
    }));

    return NextResponse.json({
      leaderboard,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
