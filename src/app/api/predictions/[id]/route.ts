import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const predictionId = resolvedParams.id;

    // Find the prediction
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
      include: { match: true },
    });

    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    // Check if user owns this prediction
    if (prediction.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if match has already started (can't cancel after match starts)
    const matchStart = new Date(prediction.match.matchDate);
    const oneHourBefore = new Date(matchStart.getTime() - 60 * 60 * 1000);
    
    if (new Date() >= oneHourBefore) {
      return NextResponse.json(
        { error: "Cannot cancel prediction less than 1 hour before match" },
        { status: 400 }
      );
    }

    // Delete the prediction
    await prisma.prediction.delete({
      where: { id: predictionId },
    });

    return NextResponse.json({ success: true, message: "Prediction cancelled" });
  } catch (error) {
    console.error("Delete prediction error:", error);
    return NextResponse.json(
      { error: "Failed to cancel prediction" },
      { status: 500 }
    );
  }
}
