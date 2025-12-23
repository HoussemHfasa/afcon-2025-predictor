import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateMatchSchema = z.object({
  scoreA: z.number().min(0).max(20).nullable(),
  scoreB: z.number().min(0).max(20).nullable(),
  status: z.enum(["UPCOMING", "LIVE", "COMPLETED", "POSTPONED", "CANCELLED"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const result = updateMatchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { scoreA, scoreB, status } = result.data;

    const match = await prisma.match.update({
      where: { id: resolvedParams.id },
      data: {
        scoreA,
        scoreB,
        status,
      },
    });

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Update match error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
